import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { CreateRoleDb, RolesDto, UpdateRoleDb } from '../dto/roles.dto';

import { and, asc, eq, sql, notInArray } from 'drizzle-orm';
import {
  DatabaseI,
  permissionsToRoles,
  roles,
  PgTrans,
  usersToRoles,
} from '@nilefy/database';
import z from 'zod';
import { permissionsTypes } from '@nilefy/permissions';

// TODO: move to somewhere else
const DEFAULT_ROLES: {
  name: string;
  description: string;
  permissions: z.infer<typeof permissionsTypes>[];
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
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

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
    workspaceId: RolesDto['workspaceId'],
    roleId: RolesDto['id'],
    roleDto: UpdateRoleDb,
  ) {
    await this.db
      .update(roles)
      .set({ updatedAt: sql`now()`, ...roleDto })
      .where(and(eq(roles.id, roleId), eq(roles.workspaceId, workspaceId)))
      .returning();
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
    if (!role) throw new NotFoundException('role not found in this workspace');
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
