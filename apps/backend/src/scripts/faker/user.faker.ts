import { faker } from '@faker-js/faker';
import { UserDto } from 'src/dto/users.dto';

/**
 * omited the id to let the db handle it
 */
export function generateFakeUser(): Omit<UserDto, 'id'> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    username: faker.internet.userName({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }),
    password: faker.internet.password(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    deletedAt: faker.helpers.arrayElement([null, null, faker.date.past()]),
  };
}
