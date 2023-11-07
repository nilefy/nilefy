import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from '../../drizzle/schema/schema';
import { sql } from 'drizzle-orm';
import { faker } from '@faker-js/faker';
import { User, generateFakeUser } from '../faker/user.faker';

const clientConfig = {
  connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
};

const client = new Client(clientConfig);

function convertUsersToInsertString(users: User[]): string {
  const values = users.map((user) => {
    const { username, email, password, createdAt, updatedAt, deletedAt } = user;

    return `('${username}', '${email}', '${password}', '${createdAt.toISOString()}', '${updatedAt.toISOString()}', ${
      deletedAt ? `'${deletedAt.toISOString()}'` : 'NULL'
    })`;
  });

  return values.join(',\n');
}

async function main() {
  await client.connect();
  const db = drizzle(client, { schema });
  db;

  const users = faker.helpers.multiple(generateFakeUser, { count: 10000 });

  const usersdb = convertUsersToInsertString(users);

  console.log(usersdb);

  await db.execute(
    sql.raw(`
    INSERT INTO users (username, email, password, created_at, updated_at, deleted_at)
VALUES 
    ${usersdb};
  `),
  );
  await client.end();
}

main();
