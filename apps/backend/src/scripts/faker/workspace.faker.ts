import { faker } from '@faker-js/faker';

export interface Workspace {
  // id: string;
  name: string;
  imageUrl: string;
  createdById: number;
  updatedById: number | null;
  deletedById: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

export function generateFakeWorkspace(): Workspace {
  const range = {
    min: 3400,
    max: 4000,
  };
  return {
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
