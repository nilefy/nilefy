import { configDotenv } from 'dotenv';
import { userSeeder } from './seeders/user.seeder';
import { workspaceSeeder } from './seeders/workspace.seeder';
import { appSeeder } from './seeders/app.seeder';
import { permissionsSeeder } from './seeders/permissions.seeder';
// import { rolesSeeder } from './seeders/roles.seeder';
import { dataSourcesSeeder } from './seeders/data_sources.seeder';
import { dbConnect } from '@webloom/database';
// import { datasourcesSeeder } from './seeders/datasources.seeder';

async function main() {
  configDotenv();
  const count = 5;
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) throw new Error('missing env var to run seeder (DB_URL)');
  const [db, client] = await dbConnect(dbUrl);

  const res = await db.transaction(async (db) => {
    const users = await userSeeder(db, count);
    const userIds = users.map((u) => u.id);
    const workspaces = await workspaceSeeder(db, userIds.length, userIds);
    const workspaceIds = workspaces.map((w) => w.id);
    // TODO: re-enable roles seeder
    await permissionsSeeder(db);
    // const permissionIds = permissions.map((p) => p.id);
    // const [adminId, ...rest] = userIds;
    // await rolesSeeder(db, adminId, rest, workspaceIds, permissionIds);
    const apps = await appSeeder(
      db,
      Math.min(userIds.length, workspaceIds.length),
      userIds,
      workspaceIds,
    );

    await dataSourcesSeeder(db);

    return users.map((u, i) => {
      const workspace = workspaces[i];
      const app = apps[i];
      if (workspace.createdById !== u.id) {
        throw new Error('workspace.createdById!== user.id');
      }
      if (app.createdById !== u.id) {
        throw new Error('app.createdById!== user.id');
      }
      return {
        email: u.email,
        password: i === 0 ? 'superadmin' : 'password',
        workspaceId: workspace.id,
        appId: app.id,
      };
    });
  });

  await client.end();
  return res;
}

main()
  .then((data) => {
    console.log(
      '🪵 [seeder.ts:60] ~ token ~ \x1b[0;32mdata\x1b[0m = ',
      data.length,
    );
    // console.log(JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    console.error('seeding failed', err);
    throw err;
  })
  .finally(() => {
    process.exit();
  });
