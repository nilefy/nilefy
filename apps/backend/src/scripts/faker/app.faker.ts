import { faker } from '@faker-js/faker';
import { AppDto } from '../../dto/apps.dto';
import { UserDto } from '../../dto/users.dto';
import { WorkspaceDto } from '../../dto/workspace.dto';

/**
 * omited the id to let the db handle it
 */
export function generateFakeApp(
  userIds: UserDto['id'][],
  workspaceIds: WorkspaceDto['id'][],
): Omit<AppDto, 'id'> {
  return {
    createdById: faker.helpers.arrayElement(userIds),
    updatedById: faker.helpers.arrayElement([...userIds, null]),
    deletedById: faker.helpers.arrayElement([...userIds, null]),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    workspaceId: faker.helpers.arrayElement(workspaceIds),
    homepageId: null,
    createdAt: faker.date.past(),
    updatedAt: faker.helpers.arrayElement([faker.date.recent(), null]),
    deletedAt: faker.helpers.arrayElement([null, null, faker.date.past()]),
  };
}
