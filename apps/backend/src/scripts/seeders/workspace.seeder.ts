import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from '../../drizzle/schema/schema';
import { sql } from 'drizzle-orm';
import { faker } from '@faker-js/faker';
import { Workspace, generateFakeWorkspace } from '../faker/workspace.faker';

const clientConfig = {
  connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
};

const client = new Client(clientConfig);

function convertWorkspacesToInsertString(workspaces: Workspace[]): string {
  const values = workspaces.map((workspace) => {
    const {
      name,
      imageUrl,
      createdById,
      updatedById,
      deletedById,
      createdAt,
      updatedAt,
      deletedAt,
    } = workspace;

    return `('${name}', '${imageUrl}', ${createdById}, ${updatedById}, ${deletedById}, '${createdAt.toISOString()}', ${
      updatedAt ? `'${updatedAt.toISOString()}'` : 'NULL'
    }, ${deletedAt ? `'${deletedAt.toISOString()}'` : 'NULL'})`;
  });

  return values.join(',\n');
}

async function main() {
  await client.connect();
  const db = drizzle(client, { schema });
  faker.seed(1);

  const workspaces = faker.helpers.multiple(generateFakeWorkspace, {
    count: 40,
  });

  const workspacesInsertString = convertWorkspacesToInsertString(workspaces);

  try {
    await db.execute(
      sql.raw(`
    INSERT INTO workspaces (name, "imageUrl", created_by_id, "updated_by_id", "deleted_by_id", "created_at", "updated_at", "deleted_at")
    VALUES  
    ${workspacesInsertString} ON CONFLICT DO NOTHING;
  `),
    );

    console.log('DATA WAS INSERTED');
  } catch (e) {
    console.log('error, DATA WASN"T INSERTED:  ' + e);
  }

  await client.end();
}

main();
