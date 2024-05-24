import { faker } from '@faker-js/faker';
import { generateFakeUser } from '../faker/user.faker';
import { SeederI } from './seeder.types';
import { UserDto } from '../../dto/users.dto';
import { chunkArray } from '../utils';
import { UsersModule } from '../../users/users.module';
import { UsersService } from '../../users/users.service';
import { WorkspaceDto } from '../../dto/workspace.dto';

/**
 * index `[0]` is the admin
 */
export const userSeeder: SeederI<
  (UserDto & { workspace: WorkspaceDto })[]
> = async (nest, tx, count) => {
  console.log('running USERS seeder');
  const userService = nest
    .select(UsersModule)
    .get(UsersService, { strict: true });
  const password = 'password';
  const fakeUsers = faker.helpers.multiple(() => generateFakeUser(password), {
    count: count - 1,
  });
  const usersChunks = chunkArray(fakeUsers, 1000);
  const admin = await userService.create(
    {
      email: 'admin@admin.com',
      username: 'admin',
      password: 'superadmin',
      emailVerified: new Date(),
    },
    { tx },
  );
  const users = [];
  for (const chunk of usersChunks) {
    users.push(
      await Promise.all(chunk.map((u) => userService.create(u, { tx }))),
    );
  }
  const res = [admin].concat(...users);
  return res;
};
