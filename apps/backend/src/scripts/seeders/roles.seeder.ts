import { faker } from '@faker-js/faker';
import { DatabaseI } from '../../drizzle/drizzle.provider';
import {
  permissionsToRoles,
  roles,
  usersToRoles,
} from '../../drizzle/schema/schema';
import { PermissionDto } from '../../dto/permissions.dto';
import { CreateRoleDb, RoleInsertI } from '../../dto/roles.dto';
import { generateFakeRole } from '../faker/role.faker';
import { UserDto } from '../../dto/users.dto';
import { WorkspaceDto } from '../../dto/workspace.dto';

export async function rolesSeeder(
  db: DatabaseI,
  adminId: UserDto['id'],
  userIds: UserDto['id'][],
  workspaceIds: WorkspaceDto['id'][],
  permissionIds: PermissionDto['id'][],
) {
  console.log('running ROLES seeder');
  const defaultRoles: (RoleInsertI & {
    permissions: PermissionDto['id'][];
    workspaces: WorkspaceDto['id'][];
    users: UserDto['id'][];
  })[] = [
    {
      name: 'admin',
      permissions: permissionIds,
      workspaces: workspaceIds,
      users: [adminId],
    },
    {
      name: 'everyone',
      permissions: [permissionIds[0], permissionIds[1]],
      workspaces: workspaceIds,
      users: userIds,
    },
  ];

  const fakeRoles = faker.helpers.multiple(
    () => generateFakeRole(adminId, userIds, workspaceIds, permissionIds),
    {
      count: 10,
    },
  );
  const rolesSeed: CreateRoleDb[] = [];

  // generate default roles in each workspace
  defaultRoles.forEach((r) => {
    r.workspaces.forEach((w) => {
      rolesSeed.push({
        name: r.name,
        workspaceId: w,
        createdById: adminId,
      });
    });
  });

  fakeRoles.forEach((r) =>
    rolesSeed.push({
      name: r.name,
      workspaceId: r.workspaceId,
      createdById: r.createdById,
    }),
  );

  const res = await db
    .insert(roles)
    .values(rolesSeed)
    .returning()
    .onConflictDoNothing();

  const permissionsSeed: { roleId: number; permissionId: number }[] = [];
  const usersSeed: { roleId: number; userId: number }[] = [];
  // admin and every one are added for each workspace
  const skip = workspaceIds.length * 2;
  res.forEach((r, i) => {
    if (r.name === 'admin') {
      usersSeed.push({
        roleId: r.id,
        userId: adminId,
      });
      defaultRoles[0].permissions.forEach((p) => {
        permissionsSeed.push({
          roleId: r.id,
          permissionId: p,
        });
      });
    } else if (r.name === 'everyone') {
      defaultRoles[1].permissions.forEach((p) => {
        permissionsSeed.push({
          roleId: r.id,
          permissionId: p,
        });
      });
    } else {
      fakeRoles[i - skip].permissions.forEach((p) =>
        permissionsSeed.push({
          roleId: r.id,
          permissionId: p,
        }),
      );
    }
  });

  // connect roles with their permissions
  await db.insert(permissionsToRoles).values(permissionsSeed);

  // connect roles with users

  await db.insert(usersToRoles).values(usersSeed);

  return res;
}
