import { faker } from '@faker-js/faker';
import { UserDto } from '../../dto/users.dto';
import { WorkspaceDto } from '../../dto/workspace.dto';
import { PermissionDto } from '../../dto/permissions.dto';
import { CreateRoleDb } from '../../dto/roles.dto';

/**
 * omited the id to let the db handle it
 */
export function generateFakeRole(
  adminId: UserDto['id'],
  userIds: UserDto['id'][],
  workspaceIds: WorkspaceDto['id'][],
  permissionIds: PermissionDto['id'][],
): Omit<CreateRoleDb, 'id'> & {
  permissions: PermissionDto['id'][];
  users: UserDto['id'][];
} {
  return {
    createdById: adminId,
    name: faker.hacker.noun(),
    description: faker.commerce.productDescription(),
    workspaceId: faker.helpers.arrayElement(workspaceIds),
    createdAt: faker.date.past(),
    permissions: faker.helpers.arrayElements(permissionIds),
    users: faker.helpers.arrayElements(userIds),
  };
}
