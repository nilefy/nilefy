import { faker } from '@faker-js/faker';
import { generateFakeUser } from '../faker/user.faker';
import { users as usersSchema } from '@webloom/database';
import { SeederI } from './seeder.types';
import { UserDto } from '../../dto/users.dto';
import { genSalt, hash } from 'bcrypt';

/**
 * index `[0]` is the admin
 */
export const userSeeder: SeederI<UserDto[]> = async (db) => {
  console.log('running USERS seeder');
  const salt = await genSalt(10);
  const password = await hash('password', salt);
  const fakeUsers = faker.helpers.multiple(() => generateFakeUser(password), {
    count: 10,
  });

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
  const users = await db
    .insert(usersSchema)
    .values(fakeUsers)
    .onConflictDoNothing()
    .returning();
  return [admin, ...users];
};
