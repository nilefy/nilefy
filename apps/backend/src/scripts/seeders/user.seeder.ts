import { faker } from '@faker-js/faker';
import { generateFakeUser } from '../faker/user.faker';
import { users as usersSchema } from '@nilefy/database';
import { SeederI } from './seeder.types';
import { UserDto } from '../../dto/users.dto';
import { genSalt, hash } from 'bcrypt';
import { chunkArray } from '../utils';

/**
 * index `[0]` is the admin
 */
export const userSeeder: SeederI<UserDto[]> = async (db, count) => {
  console.log('running USERS seeder');
  const salt = await genSalt(10);
  const password = await hash('password', salt);
  const fakeUsers = faker.helpers.multiple(() => generateFakeUser(password), {
    count: count - 1,
  });
  const usersChunks = chunkArray(fakeUsers, 1000);
  const admin = (
    await db
      .insert(usersSchema)
      .values({
        email: 'admin@admin.com',
        username: 'admin',
        password: await hash('superadmin', salt),
        emailVerified: new Date(),
      })
      .returning()
      .onConflictDoNothing()
  )[0];
  const users = await Promise.all(
    usersChunks.map((u) =>
      db.insert(usersSchema).values(u).onConflictDoNothing().returning(),
    ),
  );
  const res = [admin].concat(...users);
  return res;
};
