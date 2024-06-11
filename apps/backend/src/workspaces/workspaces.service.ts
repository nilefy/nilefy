import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import {
  CreateWorkspaceDb,
  UpdateWorkspaceDb,
  WorkspaceDto,
} from '../dto/workspace.dto';
import { and, eq, sql, exists, like, asc, inArray } from 'drizzle-orm';
import * as schema from '@nilefy/database';
import { RetUserSchema, UserDto } from '../dto/users.dto';
import { RolesService } from '../roles/roles.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';

type InvitationTokenPayload = {
  type: 'invite';
  userId: number;
  email: string;
  workspaceId: number;
  workspaceName: string;
};

@Injectable()
export class WorkspacesService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: schema.DatabaseI,
    private readonly rolesService: RolesService,
    private emailService: EmailService,
    private jwtService: JwtService,
  ) {}

  /**
   * get user's workspaces
   */
  async index(userId: UserDto['id']): Promise<WorkspaceDto[]> {
    const ws = (
      await this.db.query.usersToWorkspaces.findMany({
        where: and(
          eq(schema.usersToWorkspaces.userId, userId),
          eq(schema.usersToWorkspaces.status, 'active'),
        ),
        with: {
          workspace: true,
        },
      })
    ).map((u) => u.workspace);
    return ws;
  }

  async workspaceUsers(
    workspaceId: WorkspaceDto['id'],
    page = 1,
    pageSize = 3,
    searchQ = '',
  ): Promise<RetUserSchema[]> {
    const q = this.db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        username: schema.users.username,
        avatar: schema.users.avatar,
        onboardingCompleted: schema.users.onboardingCompleted,
        status: schema.usersToWorkspaces.status,
      })
      .from(schema.users)
      .innerJoin(
        schema.usersToWorkspaces,
        and(
          eq(schema.usersToWorkspaces.userId, schema.users.id),
          eq(schema.usersToWorkspaces.workspaceId, workspaceId),
        ),
      )
      .where(
        and(
          like(schema.users.username, sql`%${searchQ}%`).if(searchQ),
          exists(
            this.db
              .select({ userId: schema.usersToWorkspaces.userId })
              .from(schema.usersToWorkspaces)
              .where(
                and(
                  eq(schema.users.id, schema.usersToWorkspaces.userId),
                  eq(schema.usersToWorkspaces.workspaceId, workspaceId),
                ),
              ),
          ),
        ),
      )
      .$dynamic();
    return await schema.withPagination(q, asc(schema.users.id), page, pageSize);
  }

  /**
   * for business logic: create default roles for the workspace
   *
   * PLEASE NOTE: the db queries will run in db transaction, and the method can accept another tx instance or create one internally
   */
  async create(
    ws: CreateWorkspaceDb,
    options?: { tx: schema.PgTrans },
  ): Promise<WorkspaceDto> {
    return await (options?.tx
      ? this.createHelper(ws, options.tx)
      : this.db.transaction(async (tx) => {
          return await this.createHelper(ws, tx);
        }));
  }

  /**
   * create workspace/assign user to workspace/create default roles for the workspace
   */
  private async createHelper(ws: CreateWorkspaceDb, tx: schema.PgTrans) {
    const [workspace] = await tx
      .insert(schema.workspaces)
      .values(ws)
      .returning();
    await tx.insert(schema.usersToWorkspaces).values({
      userId: ws.createdById,
      workspaceId: workspace.id,
      status: 'active',
    });
    await this.rolesService.createDefault(ws.createdById, workspace.id, { tx });
    return workspace;
  }

  async update(id: number, ws: UpdateWorkspaceDb): Promise<WorkspaceDto> {
    const workspace = await this.db
      .update(schema.workspaces)
      .set({ ...ws, updatedById: ws.updatedById, updatedAt: sql`now()` })
      .where(and(eq(schema.workspaces.id, id)))
      .returning();
    return workspace[0];
  }

  private async invitationEmail(
    userId: number,
    email: string,
    workspaceId: number,
    workspaceName: string,
  ) {
    const invitationToken = await this.jwtService.signAsync(
      {
        type: 'invite',
        email: email,
        workspaceId: workspaceId,
        workspaceName,
        userId,
      } satisfies InvitationTokenPayload,
      { expiresIn: '1d' },
    );
    const url = new URL('/invitation');
    url.searchParams.set('token', invitationToken);
    console.warn(
      'DEBUGPRINT[1]: workspaces.service.ts:122: url=',
      url.toString(),
    );
    //   const html =
    //     `
    //   <a href="` +
    //     url +
    //     ` ">Accept Invite to ${workspaceName}</a>
    //   The Nilefy Team</p>
    // `;
    // await this.emailService.sendEmail({
    //   to: email,
    //   subject: 'Nilefy - Confirm Your Email Address',
    //   html,
    // });
  }
  async inviteUsers(workspaceId: number, usersEmail: string[]) {
    // TODO: handle case user doesn't exist in our database
    const [users, workspace] = await Promise.all([
      this.db.query.users.findMany({
        where: inArray(schema.users.email, usersEmail),
        columns: {
          id: true,
          email: true,
        },
      }),
      this.db.query.workspaces.findFirst({
        where: eq(schema.workspaces.id, workspaceId),
        columns: {
          id: true,
          name: true,
        },
      }),
    ]);
    if (users.length !== usersEmail.length) {
      throw new BadRequestException("some users don't exist");
    }
    await this.db.insert(schema.usersToWorkspaces).values(
      users.map((u) => ({
        userId: u.id,
        workspaceId,
        status: 'invited' as const,
      })),
    );
    await Promise.all(
      users.map((u) =>
        this.invitationEmail(u.id, u.email, workspaceId, workspace!.name),
      ),
    );
    return {
      msg: 'success',
    };
  }

  async inviteCallback(token: string, status: 'acceptted' | 'declined') {
    const { userId, workspaceId, type } =
      await this.jwtService.verifyAsync<InvitationTokenPayload>(token);
    if (type !== 'invite') {
      throw new BadRequestException('Bad Token');
    }
    const invitation = await this.db.query.usersToWorkspaces.findFirst({
      where: and(
        eq(schema.usersToWorkspaces.userId, userId),
        eq(schema.usersToWorkspaces.workspaceId, workspaceId),
      ),
      columns: {
        status: true,
      },
    });
    if (!(invitation && invitation.status === 'invited')) {
      throw new BadRequestException('already acceptted');
    }
    await this.db
      .update(schema.usersToWorkspaces)
      .set({
        status: status === 'acceptted' ? 'active' : 'declined',
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(schema.usersToWorkspaces.userId, userId),
          eq(schema.usersToWorkspaces.workspaceId, workspaceId),
        ),
      );
  }
}
