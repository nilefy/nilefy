import { dbConnect } from './drizzle.provider';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

async function main() {
  const [db, client] = await dbConnect(process.env.DB_URL as string);
  await migrate(db, { migrationsFolder: 'drizzle' });
  await client.end();
}

main().catch((err) => {
  console.log('🪵 [migrate.ts:5] ~ token ~ \x1b[0;32merr\x1b[0m = ', err);
});
