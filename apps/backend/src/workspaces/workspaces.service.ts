import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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
import {
  InvitationCallbackReq,
  InvitationTokenPayload,
} from '@nilefy/constants';
import { genSalt, hash } from 'bcrypt';

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
}
