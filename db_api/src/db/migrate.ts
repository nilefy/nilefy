import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


const db = drizzle(pool);

async function main() {
  console.log('migration started...');
  await migrate(db, { migrationsFolder : 'drizzle' });
  console.log('migration finished');

  process.exit(0);
}



main().catch(e => {

  console.log(e);
  process.exit(0);
});
