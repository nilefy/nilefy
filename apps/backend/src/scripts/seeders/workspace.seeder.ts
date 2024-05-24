import { generateFakeWorkspace } from '../faker/workspace.faker';
import { DatabaseI, usersToWorkspaces, workspaces } from '@nilefy/database';
import { UserDto } from '../../dto/users.dto';
import { chunkArray } from '../utils';

export async function workspaceSeeder(
  db: DatabaseI,
  count: number,
  userids: UserDto['id'][],
) {
  console.log('running WORKSPACES seeder');

  if (userids.length !== count) {
    throw new Error(`e ${userids.length} ${count}`);
  }

  const fakeWorkspaces = [];
  for (let i = 0; i < count; i++) {
    fakeWorkspaces.push(generateFakeWorkspace(userids[i]));
  }

  const workspacesChunks = chunkArray(fakeWorkspaces, 1000);

  const [i, ...rest] = await Promise.all(
    workspacesChunks.map(async (w) => {
      const wss = await db
        .insert(workspaces)
        .values(w)
        .onConflictDoNothing()
        .returning();
      await db
        .insert(usersToWorkspaces)
        .values(
          wss.map((ws) => ({ userId: ws.createdById, workspaceId: ws.id })),
        )
        .returning();
      return wss;
    }),
  );
  const res = [...i].concat(...rest);
  return res;
}
