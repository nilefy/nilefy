import { generateFakeApp } from '../faker/app.faker';
import { faker } from '@faker-js/faker';
import { apps } from '../../drizzle/schema/schema';
import { UserDto } from '../../dto/users.dto';
import { WorkspaceDto } from '../../dto/workspace.dto';
import { DatabaseI } from '../../drizzle/drizzle.provider';
import { components, pages } from '../../drizzle/schema/appsState.schema';

export async function appSeeder(
  db: DatabaseI,
  userIds: UserDto['id'][],
  workspaceIds: WorkspaceDto['id'][],
) {
  console.log('running APPS seeder');
  const fakeApps = faker.helpers.multiple(
    () => generateFakeApp(userIds, workspaceIds),
    {
      count: 50,
    },
  );
  const res = await db.insert(apps).values(fakeApps).returning();
  // create page for each app
  const res2 = await Promise.all(
    res.map((a) =>
      db
        .insert(pages)
        .values({
          appId: a.id,
          createdById: userIds[0],
          name: 'page 1',
          handle: 'home',
          index: 1,
        })
        .returning(),
    ),
  );

  // create component for each app;
  await Promise.all(
    res2.map((p) =>
      db.insert(components).values({
        name: 'ROOT',
        type: 'ROOT',
        isCanvas: true,
        pageId: p[0].id,
        createdById: userIds[0],
        parent: null,
        props: {},
        col: 0,
        row: 0,
        columnsCount: 0,
        rowsCount: 0,
      }),
    ),
  );

  return res;
}
