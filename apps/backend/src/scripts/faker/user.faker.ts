import { faker } from '@faker-js/faker';

export interface User {
  // id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export function generateFakeUser(): User {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    // id: faker.string.uuid(),
    username: faker.internet.userName({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }),
    password: faker.internet.password(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    deletedAt: faker.helpers.arrayElement([null, null, faker.date.past()]),
  };
}

export const user = generateFakeUser();
