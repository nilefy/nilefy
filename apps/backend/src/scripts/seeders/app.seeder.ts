import { configDotenv } from 'dotenv';
import { dbConnect } from '../../../src/drizzle/drizzle.provider';
import { AppDto } from '../../../src/dto/apps.dto';
import { generateFakeApp } from '../faker/app.faker';
import { faker } from '@faker-js/faker';
import { apps } from '../../../src/drizzle/schema/schema';

async function main() {
  configDotenv();
  const [db, client] = await dbConnect(process.env.DB_URL as string);

  const fakeApps: AppDto[] = faker.helpers.multiple(generateFakeApp, {
    count: 10,
  });
  await db.insert(apps).values(fakeApps).onConflictDoNothing();

  client.end();
}

main();
