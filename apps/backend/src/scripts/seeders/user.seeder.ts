import { faker } from '@faker-js/faker';
import { generateFakeUser } from '../faker/user.faker';
import { dbConnect } from '../../../src/drizzle/drizzle.provider';
import { configDotenv } from 'dotenv';
import { users } from '../../../src/drizzle/schema/schema';
import { UserDto } from 'src/dto/users.dto';

async function main() {
  configDotenv();
  const [db, client] = await dbConnect(process.env.DB_URL as string);

  const madeUsers: UserDto[] = faker.helpers.multiple(generateFakeUser, {
    count: 100,
  });

  await db.insert(users).values(madeUsers).onConflictDoNothing();

  client.end();
}

main();
