import { faker } from '@faker-js/faker';
import { generateFakeUser } from '../faker/user.faker';
import { users as usersSchema } from '../../drizzle/schema/schema';
import { SeederI } from './seeder.types';
import { UserDto } from '../../dto/users.dto';

export const userSeeder: SeederI<UserDto[]> = async (db) => {
  console.log('running USERS seeder');
  const fakeUsers = faker.helpers.multiple(generateFakeUser, {
    count: 100,
  });

  const admin = (
    await db
      .insert(usersSchema)
      .values({
        email: 'admin@admin.com',
        username: 'admin',
        password: 'admin',
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
