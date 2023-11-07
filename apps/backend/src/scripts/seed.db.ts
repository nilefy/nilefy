import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { TConfigService } from '../../src/evn.validation';
import * as schema from '../../src/drizzle/schema/schema';
import { faker } from '@faker-js/faker';
import { generateFakeUser, user } from './faker/user.faker';
import { sql } from 'drizzle-orm';

const configService = new TConfigService();

const client = new Client(configService.get('DB_URL'));

async function connect() {
  await client.connect();
  const db = drizzle(client, { schema });
  return db;
}

export async function seed() {
  const db = await connect();
  const users = faker.helpers.multiple(generateFakeUser, { count: 100 });
  const u = user;
  await db.execute(
    //     sql.raw(
    //       ` INSERT INTO users (username, email, password, created_at, updated_at, deleted_at)
    // VALUES ${users.map((u) => '(' + Object.values(u).join(',') + ')').join(',')};`,
    //     ),
    sql.raw(
      `INSERT INTO users (username, email, password, created_at, updated_at, deleted_at) VALUES ();`,
    ),
  );

  const insertValues = users.map((user) => {
    return [
      user.username,
      user.email,
      user.password,
      new Date(),
      new Date(),
      null,
    ];
  });
  insertValues;
  u;
  console.log(insertValues);
  console.log(u);
}

seed();
