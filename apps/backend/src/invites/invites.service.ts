import { JwtService } from '@nestjs/jwt';
import { DrizzleAsyncProvider } from '@nilefy/database';
import * as schema from '@nilefy/database';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { InvitationTokenPayload } from '@nilefy/constants';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { and, eq, sql, inArray } from 'drizzle-orm';
import { InvitationCallbackReq } from '@nilefy/constants';
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import { EnvSchema } from '../evn.validation';

@Injectable()
export class InvitesService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: schema.DatabaseI,
    private userService: UsersService,
    private emailService: EmailService,
    private jwtService: JwtService,
    private configService: ConfigService<EnvSchema, true>,
  ) {}

  private async createInviteToken(
    userId: number,
    email: string,
    workspaceId: number,
    workspaceName: string,
  ) {
    return await this.jwtService.signAsync(
      {
        type: 'invite',
        email: email,
        workspaceId: workspaceId,
        workspaceName,
        userId,
      } satisfies InvitationTokenPayload,
      { expiresIn: '1d' },
    );
  }

  private createInviteLink(token: string) {
    const url = new URL(
      '/invitation',
      this.configService.get('NODE_ENV') === 'development'
        ? this.configService.get('BASE_URL_FE')
        : this.configService.get('BASE_URL_BE'),
    );
    url.searchParams.set('token', token);
    return url.toString();
  }

  private async existingUserInvitationEmail(
    email: string,
    workspaceName: string,
    url: string,
  ) {
    const html =
      `
      <a href="` +
      url +
      ` ">Accept Invite to ${workspaceName}</a>
      The Nilefy Team</p>
    `;
    await this.emailService.sendEmail({
      to: email,
      subject: 'Nilefy - Invite',
      html,
    });
  }

  private async newUserInvitationEmail(
    email: string,
    workspaceName: string,
    url: string,
  ) {
    const html =
      `
  <p>join nilefy</p>
      <a href="` +
      url +
      ` ">Accept Invite to ${workspaceName}</a>
      The Nilefy Team</p>
    `;
    await this.emailService.sendEmail({
      to: email,
      subject: 'Nilefy - Invite',
      html,
    });
  }

  private async inviteExistingUsers(
    workspaceId: number,
    workspaceName: string,
    usersData: { email: string; id: number }[],
  ) {
    // TODO: return to the front user emails who couldn't be added
    const usersData2 = await Promise.all(
      usersData.map(async (u) => {
        const token = await this.createInviteToken(
          u.id,
          u.email,
          workspaceId,
          workspaceName,
        );
        const url = this.createInviteLink(token);
        return {
          ...u,
          token,
          url,
        };
      }),
    );

    if (usersData2.length > 0) {
      await Promise.all([
        this.db.insert(schema.usersToWorkspaces).values(
          usersData2.map((u) => ({
            userId: u.id,
            workspaceId,
            status: 'invited' as const,
            invitationToken: u.token,
          })),
        ),

        ...usersData2.map((u) =>
          this.existingUserInvitationEmail(u.email, workspaceName, u.url),
        ),
      ]);
    }
  }

  private async inviteNewUsers(
    workspaceId: number,
    workspaceName: string,
    userEmails: string[],
  ) {
    const users = await Promise.all(
      userEmails.map((e) =>
        this.userService.create({
          email: e,
          status: 'invited',
          username: e.split('@')[0],
        }),
      ),
    );

    const usersData2 = await Promise.all(
      users.map(async (u) => {
        const token = await this.createInviteToken(
          u.id,
          u.email,
          workspaceId,
          workspaceName,
        );
        const url = this.createInviteLink(token);
        return {
          ...u,
          token,
          url,
        };
      }),
    );

    if (usersData2.length > 0) {
      await Promise.all([
        this.db.insert(schema.usersToWorkspaces).values(
          usersData2.map((u) => ({
            userId: u.id,
            workspaceId,
            status: 'invited' as const,
            invitationToken: u.token,
          })),
        ),

        ...usersData2.map((u) =>
          this.newUserInvitationEmail(u.email, workspaceName, u.url),
        ),
      ]);
    }
  }

  async inviteUsers(workspaceId: number, usersEmail: string[]) {
    // TODO: for now i filiter users that already exist in the workspace in the future would be better to return list to the user with failed users
    const [existingUsersData, workspace] = await Promise.all([
      this.db.query.users.findMany({
        where: and(inArray(schema.users.email, usersEmail)),
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
    const existingUsersEmails = existingUsersData.map((u) => u.email);
    const newUsersEmails = _.difference(usersEmail, existingUsersEmails);
    await Promise.all([
      this.inviteExistingUsers(
        workspace!.id,
        workspace!.name,
        existingUsersData,
      ),
      this.inviteNewUsers(workspace!.id, workspace!.name, newUsersEmails),
    ]);
    return {
      msg: 'Invited users',
    };
  }

  async validateInviteToken(token: string): Promise<InvitationTokenPayload> {
    const payload =
      await this.jwtService.verifyAsync<InvitationTokenPayload>(token);
    if (payload.type !== 'invite') {
      throw new BadRequestException('Bad token');
    }
    return payload;
  }

  /**
   * for the front to check the invitation token status ASAP and to know which view should be rendered, new user or existing user invite
   */
  async checkInvite(token: string) {
    const tokenPayload = await this.validateInviteToken(token);
    const invitation = await this.db.query.usersToWorkspaces.findFirst({
      where: and(
        eq(schema.usersToWorkspaces.userId, tokenPayload.userId),
        eq(schema.usersToWorkspaces.workspaceId, tokenPayload.workspaceId),
      ),
      columns: {
        status: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            status: true,
          },
        },
      },
    });
    if (!invitation) {
      Logger.error({
        msg: "Invitation doesn't exist but the jwt validation passed HOW",
        token,
        tokenPayload,
      });
      throw new InternalServerErrorException("Invitation doesn't exist");
    }
    switch (invitation.status) {
      case 'active': {
        throw new BadRequestException('already acceptted');
      }
      case 'archived': {
        throw new BadRequestException('outdated invitation');
      }
      case 'declined': {
        throw new BadRequestException(
          'User declined the invite, please ask the workspace admin to send another invite',
        );
      }
      case 'invited': {
        const userStatus: 'existingUser' | 'newUser' =
          invitation.user.status === 'active' ? 'existingUser' : 'newUser';
        return { invitation: invitation, tokenPayload, userStatus };
      }
    }
  }

  /**
   * user sends newUser with password means they accept the invite
   */
  async inviteCallback(dto: InvitationCallbackReq) {
    const {
      invitation,
      userStatus,
      tokenPayload: { userId, workspaceId },
    } = await this.checkInvite(dto.token);

    // new user case
    if (userStatus === 'newUser' && dto.userStatus === 'newUser') {
      await Promise.all([
        this.userService.update(invitation.user.id, {
          password: dto.password,
          status: 'active',
          emailVerified: new Date(),
        }),

        this.db
          .update(schema.usersToWorkspaces)
          .set({
            status: 'active',
            updatedAt: sql`now()`,
            invitationToken: null,
          })
          .where(
            and(
              eq(schema.usersToWorkspaces.userId, userId),
              eq(schema.usersToWorkspaces.workspaceId, workspaceId),
            ),
          ),
      ]);
      return { msg: 'Invitation accepted successfully, you can login in now' };
    } else if (userStatus === 'newUser') {
      throw new BadRequestException('New user userStatus must equal "newUser"');
    }

    // existing user case
    if (userStatus === 'existingUser' && dto.userStatus === 'existingUser') {
      await this.db
        .update(schema.usersToWorkspaces)
        .set({
          status: dto.status === 'acceptted' ? 'active' : 'declined',
          updatedAt: sql`now()`,
          declinedAt: dto.status === 'declined' ? sql`now()` : undefined,
          invitationToken: dto.status === 'acceptted' ? null : undefined,
        })
        .where(
          and(
            eq(schema.usersToWorkspaces.userId, userId),
            eq(schema.usersToWorkspaces.workspaceId, workspaceId),
          ),
        );
      return { msg: 'Invitation accepted successfully' };
    } else if (userStatus === 'existingUser') {
      throw new BadRequestException(
        'Existing userStatus must equal "existingUser"',
      );
    }

    Logger.error({ msg: 'No case matched for invitation callback', dto });
    throw new InternalServerErrorException();
  }
}
