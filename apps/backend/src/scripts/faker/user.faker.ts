import { faker } from '@faker-js/faker';

import { JwtService } from '@nestjs/jwt';

import { UserDto } from 'src/dto/users.dto';

/**
 * omited the id to let the db handle it
 */
export function generateFakeUser(userPassword: string): Omit<UserDto, 'id'> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const jwt = new JwtService();
  const token = jwt.sign({ sub: 1, username: 'mohamed' });
  return {
    username: faker.internet.userName({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }),
    password: userPassword,
    conformationToken: token,
    isConfirmed: faker.datatype.boolean(0.8),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    deletedAt: faker.helpers.arrayElement([null, null, faker.date.past()]),
  };
}
