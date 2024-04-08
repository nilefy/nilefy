import { faker } from '@faker-js/faker';
import { generateFakeWorkspace } from '../faker/workspace.faker';
import { DatabaseI, workspaces } from '@webloom/database';
import { UserDto } from '../../dto/users.dto';

export async function workspaceSeeder(db: DatabaseI, userids: UserDto['id'][]) {
  console.log('running WORKSPACES seeder');

  const fakeWorkspaces = faker.helpers.multiple(
    () => generateFakeWorkspace(userids),
    {
      count: 40,
    },
  );

  return await db
    .insert(workspaces)
    .values(fakeWorkspaces)
    .returning()
    .onConflictDoNothing();
}
