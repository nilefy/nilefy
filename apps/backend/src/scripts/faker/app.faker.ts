import { faker } from '@faker-js/faker';
import { AppDto } from '../../../src/dto/apps.dto';

export function generateFakeApp(): AppDto {
  const range = {
    min: 3388,
    max: 4000,
  };
  return {
    id: faker.number.int(range),
    createdById: faker.number.int(range),
    updatedById: faker.helpers.arrayElement([faker.number.int(range), null]),
    deletedById: faker.helpers.arrayElement([faker.number.int(range), null]),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    state: {},
    workspaceId: faker.number.int(range),
    createdAt: faker.date.past(),
    updatedAt: faker.helpers.arrayElement([faker.date.recent(), null]),
    deletedAt: faker.helpers.arrayElement([null, null, faker.date.past()]),
  };
}
