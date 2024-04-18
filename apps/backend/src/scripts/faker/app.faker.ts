import { faker } from '@faker-js/faker';
import { AppDto } from '../../dto/apps.dto';
import { UserDto } from '../../dto/users.dto';
import { WorkspaceDto } from '../../dto/workspace.dto';

/**
 * omited the id to let the db handle it
 */
export function generateFakeApp(
  userId: UserDto['id'],
  workspaceId: WorkspaceDto['id'],
): Omit<AppDto, 'id'> {
  return {
    createdById: userId,
    updatedById: faker.helpers.arrayElement([userId, null]),
    deletedById: null,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    workspaceId: workspaceId,
    createdAt: faker.date.past(),
    updatedAt: faker.helpers.arrayElement([faker.date.recent(), null]),
    deletedAt: faker.helpers.arrayElement([null, null, faker.date.past()]),
  };
}
