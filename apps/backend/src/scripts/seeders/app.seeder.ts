import { generateFakeApp } from '../faker/app.faker';
import { UserDto } from '../../dto/users.dto';
import { WorkspaceDto } from '../../dto/workspace.dto';
import { EDITOR_CONSTANTS } from '@webloom/constants';
import { apps, components, DatabaseI, pages } from '@webloom/database';
import { chunkArray } from '../../utils';

export async function appSeeder(
  db: DatabaseI,
  count: number,
  userIds: UserDto['id'][],
  workspaceIds: WorkspaceDto['id'][],
) {
  console.log('running APPS seeder');
  const fakeApps = [];
  for (let i = 0; i < count; i++) {
    fakeApps.push(generateFakeApp(userIds[i], workspaceIds[i]));
  }

  const appsChunks = chunkArray(fakeApps, 1000);

  const [i, ...rest] = await Promise.all(
    appsChunks.map(async (a) => {
      const appsRes = await db.insert(apps).values(a).returning();

      const appsPages = appsRes.map((a) => ({
        appId: a.id,
        createdById: userIds[0],
        name: 'page 1',
        handle: 'home',
        index: 1,
      }));
      // create page for each app

      const pagesRes = await db.insert(pages).values(appsPages).returning();

      // create component for each app;
      const coms = pagesRes.map((p) => ({
        id: EDITOR_CONSTANTS.ROOT_NODE_ID,
        type: 'WebloomContainer',
        pageId: p.id,
        createdById: userIds[0],
        parentId: null,
        props: {
          className: 'h-full w-full',
          isCanvas: true,
        },
        col: 0,
        row: 0,
        columnsCount: EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
        rowsCount: 0,
      }));
      await db.insert(components).values(coms);
      return appsRes;
    }),
  );

  return [...i].concat(...rest);
}
