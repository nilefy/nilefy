import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseI, DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import { CreateRoleDb, RolesDto, UpdateRoleDb } from '../dto/roles.dto';
import { roles, usersToRoles } from '../drizzle/schema/schema';
import { and, asc, eq, isNull, ne, sql } from 'drizzle-orm';

@Injectable()
export class RolesService {
  constructor(@Inject(DrizzleAsyncProvider) private db: DatabaseI) {}

  async index(workspaceId: RolesDto['workspaceId']): Promise<RolesDto[]> {
    return await this.db.query.roles.findMany({
      where: and(eq(roles.workspaceId, workspaceId), isNull(roles.deletedAt)),
      orderBy: [asc(roles.createdAt)],
    });
  }

  async one(workspaceId: RolesDto['workspaceId'], roleId: RolesDto['id']) {
    const role = await this.db.query.roles.findFirst({
      where: and(
        eq(roles.workspaceId, workspaceId),
        eq(roles.id, roleId),
        isNull(roles.deletedAt),
      ),
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

  async update(
    workspaceId: RolesDto['workspaceId'],
    roleId: RolesDto['id'],
    roleDto: UpdateRoleDb,
  ) {
    console.log(roleDto);
    await this.db
      .update(roles)
      .set({ updatedAt: sql`now()`, ...roleDto })
      .where(
        and(
          eq(roles.id, roleId),
          eq(roles.workspaceId, workspaceId),
          isNull(roles.deletedAt),
        ),
      )
      .returning();
  }

  async delete({
    workspaceId,
    roleId,
    deletedById,
  }: {
    deletedById: RolesDto['deletedById'];
    roleId: RolesDto['id'];
    workspaceId: RolesDto['workspaceId'];
  }): Promise<RolesDto> {
    const role = await this.db.transaction(async (tx) => {
      const [role] = await this.db
        .update(roles)
        .set({ deletedAt: sql`now()`, deletedById })
        .where(
          and(
            eq(roles.id, roleId),
            eq(roles.workspaceId, workspaceId),
            ne(roles.name, 'admin'),
            ne(roles.name, 'everyone'),
            isNull(roles.deletedAt),
          ),
        )
        .returning();

      if (!role) throw new NotFoundException('app not found in this workspace');
      // delete this role relations with users
      await tx.delete(usersToRoles).where(eq(usersToRoles.roleId, roleId));
      return role;
    });
    return role;
  }
}
