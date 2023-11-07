import { faker } from '@faker-js/faker';
import { UserDto } from 'src/dto/users.dto';

export function generateFakeUser(): UserDto {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    id: faker.number.int({
      min: 0,
      max: 10000,
    }),
    username: faker.internet.userName({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }),
    password: faker.internet.password(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    deletedAt: faker.helpers.arrayElement([null, null, faker.date.past()]),
  };
}

export const user = generateFakeUser();
