import { configDotenv } from 'dotenv';
import { dbConnect } from '../drizzle/drizzle.provider';
import { userSeeder } from './seeders/user.seeder';
import { workspaceSeeder } from './seeders/workspace.seeder';
import { appSeeder } from './seeders/app.seeder';
import { permissionsSeeder } from './seeders/permissions.seeder';
import { rolesSeeder } from './seeders/roles.seeder';

async function main() {
  configDotenv();
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) throw new Error('missing env var to run seeder (DB_URL)');
  const [db, client] = await dbConnect(dbUrl);

  const users = await userSeeder(db);
  const userIds = users.map((u) => u.id);
  const workspaces = await workspaceSeeder(db, userIds);

  const workspaceIds = workspaces.map((w) => w.id);
  const permissions = await permissionsSeeder(db);
  const permissionIds = permissions.map((p) => p.id);
  const [adminId, ...rest] = userIds;
  await rolesSeeder(db, adminId, rest, workspaceIds, permissionIds);
  await appSeeder(db, userIds, workspaceIds);

  client.end();
}

main()
  .then(() => {
    console.log('finished seeding');
  })
  .catch((err) => {
    console.error('seeding failed');
    throw err;
  });
