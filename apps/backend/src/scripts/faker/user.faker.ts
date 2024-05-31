import { faker } from '@faker-js/faker';
import { UserDto } from 'src/dto/users.dto';

/**
 * omited the id to let the db handle it
 */
export function generateFakeUser(userPassword: string): Omit<UserDto, 'id'> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    username: faker.internet.userName({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }),
    password: userPassword,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    avatar: null,
    conformationToken: null,
    emailVerified: null,
    onboardingCompleted: false,
  };
}
