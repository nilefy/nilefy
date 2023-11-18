import { configDotenv } from 'dotenv';
import { dbConnect } from '../drizzle/drizzle.provider';
import { userSeeder } from './seeders/user.seeder';
import { workspaceSeeder } from './seeders/workspace.seeder';
import { appSeeder } from './seeders/app.seeder';

async function main() {
  configDotenv();
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) throw new Error('missing env var to run seeder (DB_URL)');
  const [db, client] = await dbConnect(dbUrl);

  const users = await userSeeder(db);
  const userIds = users.map((u) => u.id);
  const workspaces = await workspaceSeeder(db, userIds);
  await appSeeder(
    db,
    userIds,
    workspaces.map((w) => w.id),
  );

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
