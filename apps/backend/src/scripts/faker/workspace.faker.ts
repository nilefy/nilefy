import { faker } from '@faker-js/faker';
import { UserDto } from '../../dto/users.dto';
import { WorkspaceDto } from '../../dto/workspace.dto';

/**
 * omited the id to let the db handle it
 */
export function generateFakeWorkspace(
  id: UserDto['id'],
): Omit<WorkspaceDto, 'id'> {
  return {
    name: faker.company.name(),
    imageUrl: faker.internet.avatar(),
    createdById: id,
    updatedById: faker.helpers.arrayElement([id, null]),
    createdAt: faker.date.past(),
    updatedAt: faker.helpers.arrayElement([faker.date.recent(), null]),
  };
}
