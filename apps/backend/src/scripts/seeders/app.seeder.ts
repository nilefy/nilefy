import { generateFakeApp } from '../faker/app.faker';
import { faker } from '@faker-js/faker';
import { apps } from '../../drizzle/schema/schema';
import { UserDto } from '../../dto/users.dto';
import { WorkspaceDto } from '../../dto/workspace.dto';
import { DatabaseI } from '../../drizzle/drizzle.provider';

export async function appSeeder(
  db: DatabaseI,
  userIds: UserDto['id'][],
  workspaceIds: WorkspaceDto['id'][],
) {
  console.log('running APPS seeder');
  const fakeApps = faker.helpers.multiple(
    () => generateFakeApp(userIds, workspaceIds),
    {
      count: 10,
    },
  );
  return await db
    .insert(apps)
    .values(fakeApps)
    .returning()
    .onConflictDoNothing();
}
