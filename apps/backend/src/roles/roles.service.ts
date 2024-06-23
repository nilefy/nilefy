import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { CreateRoleDb, RolesDto, RoleUpdateI } from '../dto/roles.dto';

import { and, asc, eq, sql, notInArray, inArray } from 'drizzle-orm';
import {
  DatabaseI,
  permissionsToRoles,
  roles,
  PgTrans,
  usersToRoles,
  appsToRoles,
} from '@nilefy/database';
import { permissionsTypes, PermissionsTypes } from '@nilefy/permissions';
import { AuthorizationUtilsService } from '../authorization-utils/authorization-utils.service';

// TODO: move to somewhere else
const DEFAULT_ROLES: {
  name: string;
  description: string;
  permissions: PermissionsTypes[];
}[] = [
  {
    name: 'admin',
    description:
      'admin role, cannot be deleted, members of this roles have access to everything in the workspace',
    permissions: permissionsTypes.options,
  },
  {
    name: 'everyone',
    description: 'everyone will be assigned to this role and cannot be deleted',
    permissions: ['Apps-Write', 'Apps-Delete'],
  },
];

const DEFAULT_ROLES_NAMES = DEFAULT_ROLES.map((r) => r.name);
@Injectable()
export class RolesService {
  constructor(
    @Inject(DrizzleAsyncProvider) private db: DatabaseI,
    private authUtils: AuthorizationUtilsService,
  ) {}

  async index(workspaceId: RolesDto['workspaceId']): Promise<RolesDto[]> {
    return await this.db.query.roles.findMany({
      where: eq(roles.workspaceId, workspaceId),
      orderBy: [asc(roles.createdAt)],
    });
  }

  async one(workspaceId: RolesDto['workspaceId'], roleId: RolesDto['id']) {
    const role = await this.db.query.roles.findFirst({
      where: and(eq(roles.workspaceId, workspaceId), eq(roles.id, roleId)),
      columns: {
        id: true,
        name: true,
        description: true,
      },
      with: {
        apps: {
          columns: {
            permission: true,
          },
          with: {
            app: true,
          },
        },
        permissionsToRoles: {
          columns: {},
          with: {
            permission: true,
          },
        },
        usersToRoles: {
          columns: {},
          with: {
            user: {
              columns: {
                password: false,
                conformationToken: false,
                emailVerified: false,
              },
            },
          },
        },
      },
    });
    if (!role) throw new NotFoundException();
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissionsToRoles.map((r) => r.permission),
      users: role.usersToRoles.map((u) => u.user),
      apps: role.apps.map((a) => ({
        permission: a.permission,
        ...a.app,
      })),
    };
  }

  async create(roleDto: CreateRoleDb) {
    return (await this.db.insert(roles).values(roleDto).returning())[0];
  }

  /**
   * create default roles for workspace
   *
   * please note: it also assign this user to default roles
   */
  async createDefault(
    userId: number,
    workspaceId: number,
    options?: { tx: PgTrans },
  ) {
    return await (options?.tx
      ? this.createDefultHelper(userId, workspaceId, options.tx)
      : this.db.transaction(async (tx) => {
          return await this.createDefultHelper(userId, workspaceId, tx);
        }));
  }

  private async createDefultHelper(
    userId: number,
    workspaceId: number,
    tx: PgTrans,
  ) {
    // get permissions from database to know their ids
    const permissions = await tx.query.permissions.findMany({
      columns: {
        id: true,
        name: true,
      },
    });
    await Promise.all(
      DEFAULT_ROLES.map(async (r) => {
        /// convert permissions names to ids
        const ids = r.permissions.map((p) => {
          const permission = permissions.find((pr) => pr.name === p);
          if (!permission) throw new InternalServerErrorException();
          return permission.id;
        });
        const [role] = await tx
          .insert(roles)
          .values({
            createdById: userId,
            workspaceId,
            ...r,
          })
          .returning({ id: roles.id });
        // insert permissions to roles
        await tx.insert(permissionsToRoles).values(
          ids.map((id) => ({
            permissionId: id,
            roleId: role.id,
          })),
        );
        return tx.insert(usersToRoles).values({
          roleId: role.id,
          userId,
        });
      }),
    );
  }

  // TODO: cannot update default roles
  async update(
    currentUserId: number,
    workspaceId: RolesDto['workspaceId'],
    roleId: RolesDto['id'],
    roleDto: RoleUpdateI,
  ) {
    const role = await this.db
      .update(roles)
      .set({
        updatedAt: sql`now()`,
        updatedById: currentUserId,
        description: roleDto.description ?? undefined,
        name: roleDto.name ?? undefined,
      })
      .where(
        and(
          eq(roles.id, roleId),
          eq(roles.workspaceId, workspaceId),
          // DON'T UPDATE DEFAULT ROLES
          // notInArray(roles.name, DEFAULT_ROLES_NAMES),
        ),
      )
      .returning();
    if (!role) {
      throw new NotFoundException('No role');
    }
    // TODO: don't allow adding users to everone role(we should add users automatially to this role)
    if (roleDto.addUsers && roleDto.addUsers.length > 0) {
      if (
        !(await this.authUtils.doesWorkspaceOwnsUsers(
          workspaceId,
          roleDto.addUsers,
        ))
      ) {
        throw new BadRequestException('Cannot control those users');
      }
      await this.db
        .insert(usersToRoles)
        .values(roleDto.addUsers.map((u) => ({ roleId: roleId, userId: u })));
    }
    // TODO: don't delete admin from admin role hhh
    if (roleDto.removeUsers && roleDto.removeUsers.length > 0) {
      if (
        !(await this.authUtils.doesWorkspaceOwnsUsers(
          workspaceId,
          roleDto.removeUsers,
        ))
      ) {
        throw new BadRequestException('Cannot control those users');
      }
      await this.db
        .delete(usersToRoles)
        .where(
          and(
            eq(usersToRoles.roleId, roleId),
            inArray(usersToRoles.userId, roleDto.removeUsers),
          ),
        );
    }

    if (roleDto.addApps && roleDto.addApps.length > 0) {
      if (
        !(await this.authUtils.doesWorkspaceOwnsApps(
          workspaceId,
          roleDto.addApps.map((a) => a.appId),
        ))
      ) {
        throw new BadRequestException('Cannot control those apps');
      }
      await this.db
        .insert(appsToRoles)
        .values(
          roleDto.addApps.map((a) => ({
            roleId: roleId,
            appId: a.appId,
            permission: a.permission,
          })),
        )
        .onConflictDoUpdate({
          target: [appsToRoles.roleId, appsToRoles.appId],
          set: {
            permission: sql.raw(`excluded.${appsToRoles.permission.name}`),
          },
        });
    }
    // TODO: don't delete apps from admin role
    if (roleDto.removeApps && roleDto.removeApps.length > 0) {
      if (
        !(await this.authUtils.doesWorkspaceOwnsApps(
          workspaceId,
          roleDto.removeApps,
        ))
      ) {
        throw new BadRequestException('Cannot control those apps');
      }
      await this.db
        .delete(appsToRoles)
        .where(
          and(
            eq(appsToRoles.roleId, roleId),
            inArray(appsToRoles.appId, roleDto.removeApps),
          ),
        );
    }
    return role;
  }

  async delete({
    workspaceId,
    roleId,
  }: {
    roleId: RolesDto['id'];
    workspaceId: RolesDto['workspaceId'];
  }): Promise<RolesDto> {
    const [role] = await this.db
      .delete(roles)
      .where(
        and(
          eq(roles.id, roleId),
          eq(roles.workspaceId, workspaceId),
          // DON'T DELETE DEFAULT ROLES
          notInArray(roles.name, DEFAULT_ROLES_NAMES),
        ),
      )
      .returning();
    if (!role) throw new NotFoundException('Role not found in this workspace');
    return role;
  }

  async togglePermission(
    workspaceId: number,
    roleId: number,
    permissionId: number,
  ) {
    return await this.db.transaction(async (tx) => {
      // there's pk on (roleId, permissionId) so if there would be something deleted would be in index 0
      const r = (
        await tx
          .delete(permissionsToRoles)
          .where(
            and(
              eq(permissionsToRoles.roleId, roleId),
              eq(permissionsToRoles.permissionId, permissionId),
            ),
          )
          .returning()
      )[0] as { roleId: number; permissionId: number } | undefined;
      // if there's returned value that means i indeed toggled the relation
      if (r !== undefined) {
        return r;
        // if not add the relation
      } else {
        return (
          await tx
            .insert(permissionsToRoles)
            .values({ roleId, permissionId })
            .returning()
        )[0];
      }
    });
  }
}
