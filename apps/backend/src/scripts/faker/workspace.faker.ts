import { faker } from '@faker-js/faker';
import { UserDto } from '../../dto/users.dto';
import { WorkspaceDto } from '../../dto/workspace.dto';

/**
 * omited the id to let the db handle it
 */
export function generateFakeWorkspace(
  ids: UserDto['id'][],
): Omit<WorkspaceDto, 'id'> {
  return {
    name: faker.company.name(),
    imageUrl: faker.internet.avatar(),
    createdById: faker.helpers.arrayElement(ids),
    updatedById: faker.helpers.arrayElement([...ids, null]),
    deletedById: faker.helpers.arrayElement([...ids, null]),
    createdAt: faker.date.past(),
    deletedAt: faker.helpers.arrayElement([null, null, faker.date.past()]),
    updatedAt: faker.helpers.arrayElement([faker.date.recent(), null]),
  };
}
