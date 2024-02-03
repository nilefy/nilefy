import { faker } from '@faker-js/faker';

import { UserDto } from 'src/dto/users.dto';

/**
 * omited the id to let the db handle it
 */
export function generateFakeUser(userPassword: string): Omit<UserDto, 'id'> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  // const jwt = new JwtService();
  // const fakePayload = {
  //   userId: 123,
  //   username: 'john_doe',
  //   isAdmin: false,
  // };
  // const fakeOptions = {
  //   expiresIn: '1h',
  // };

  // const token = jwt.sign(fakePayload, fakeOptions);
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

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
