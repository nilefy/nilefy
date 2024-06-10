import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { DatabaseI, DrizzleAsyncProvider } from '@nilefy/database';
import { syncDataSources } from './syncDatasources';

async function main() {
  // check nest standalone application docs to understand setup https://docs.nestjs.com/standalone-applications
  const app = await NestFactory.createApplicationContext(AppModule);
  const db: DatabaseI = app
    .select(DrizzleModule)
    .get(DrizzleAsyncProvider, { strict: true });
  await db.transaction(async (db) => {
    await syncDataSources(db);
  });

  await app.close();
}

main()
  .catch((err) => {
    console.error('seeding failed', err);
    throw err;
  })
  .finally(() => {
    process.exit();
  });
