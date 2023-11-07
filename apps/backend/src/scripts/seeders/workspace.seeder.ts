import { faker } from '@faker-js/faker';
import { generateFakeWorkspace } from '../faker/workspace.faker';
import { configDotenv } from 'dotenv';
import { dbConnect } from '../../../src/drizzle/drizzle.provider';
import { workspaces } from '../../../src/drizzle/schema/schema';

async function main() {
  configDotenv();
  const [db, client] = await dbConnect(process.env.DB_URL as string);
  // faker.seed(1);

  const fakeWorkspaces = faker.helpers.multiple(generateFakeWorkspace, {
    count: 40,
  });

  await db.insert(workspaces).values(fakeWorkspaces).onConflictDoNothing();

  await client.end();
}

main();
