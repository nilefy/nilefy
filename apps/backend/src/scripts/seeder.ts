import { userSeeder } from './seeders/user.seeder';
import { appSeeder } from './seeders/app.seeder';
import { permissionsSeeder } from './seeders/permissions.seeder';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { DatabaseI, DrizzleAsyncProvider } from '@nilefy/database';
import { dataSourcesSeeder } from './seeders/data_sources.seeder';

async function main() {
  // check nest standalone application docs to understand setup https://docs.nestjs.com/standalone-applications
  const app = await NestFactory.createApplicationContext(AppModule);
  const count = 5;
  const db: DatabaseI = app
    .select(DrizzleModule)
    .get(DrizzleAsyncProvider, { strict: true });
  await db.transaction(async (db) => {
    await permissionsSeeder(db);
    const usersWithWorkspace = await userSeeder(app, db, count);
    await appSeeder(
      app,
      db,
      usersWithWorkspace.map((u) => [u.id, u.workspace.id]),
    );

    await dataSourcesSeeder(db);
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
