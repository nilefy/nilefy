import { faker } from '@faker-js/faker';
import { generateFakeWorkspace } from '../faker/workspace.faker';
import { DatabaseI, usersToWorkspaces, workspaces } from '@webloom/database';
import { UserDto } from '../../dto/users.dto';

export async function workspaceSeeder(db: DatabaseI, userids: UserDto['id'][]) {
  console.log('running WORKSPACES seeder');

  const fakeWorkspaces = faker.helpers.multiple(
    () => generateFakeWorkspace(userids),
    {
      count: 40,
    },
  );

  const wss = await db
    .insert(workspaces)
    .values(fakeWorkspaces)
    .returning()
    .onConflictDoNothing();
  await db
    .insert(usersToWorkspaces)
    .values(wss.map((ws) => ({ userId: ws.createdById, workspaceId: ws.id })))
    .returning();
  return wss;
}
