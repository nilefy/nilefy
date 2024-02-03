import { faker } from '@faker-js/faker';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { configDotenv } from 'dotenv';
import { PayloadUser } from 'src/auth/auth.types';

import { UserDto } from 'src/dto/users.dto';

/**
 * omited the id to let the db handle it
 */
export function generateFakeUser(userPassword: string): Omit<UserDto, 'id'> {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const jwt = new JwtService();
  const fakePayload: PayloadUser = {
    sub: 1,
    username: firstName + lastName,
  };
  configDotenv();
  const secret = process.env.JWT_SECRET;
  console.log(secret);
  const fakeOptions: JwtSignOptions = {
    secret: secret,
  };

  const token = jwt.sign(fakePayload, fakeOptions);

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
