import { faker } from '@faker-js/faker';
import { WorkspaceDto } from 'src/dto/workspace.dto';

export function generateFakeWorkspace(): WorkspaceDto {
  const range = {
    min: 3400, //change to `your` the user id range
    max: 4000,
  };
  range;
  return {
    id: faker.number.int(range),
    name: faker.company.name(),
    imageUrl: faker.internet.avatar(),
    createdById: faker.number.int(range),
    updatedById: faker.helpers.arrayElement([faker.number.int(range), null]),
    deletedById: faker.helpers.arrayElement([faker.number.int(range), null]),
    createdAt: faker.date.past(),
    deletedAt: faker.helpers.arrayElement([null, null, faker.date.past()]),
    updatedAt: faker.helpers.arrayElement([faker.date.recent(), null]),
  };
}

export const workspace = generateFakeWorkspace();
