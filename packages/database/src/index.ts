
import {
  drizzle,
  NodePgDatabase,
  NodePgQueryResultHKT,
} from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema/schema';
import * as appStateSchema from './schema/appsState.schema';
import * as ds_schema from './schema/data_sources.schema';
import * as relations from './schema/relations';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { ExtractTablesWithRelations } from 'drizzle-orm';
export * from './schema/schema';
export * from './schema/appsState.schema';
export * from './schema/data_sources.schema';
export * from './schema/relations';
export type SchemaT = typeof schema &
  typeof ds_schema &
  typeof appStateSchema &
  typeof relations;
export type DatabaseI = NodePgDatabase<SchemaT>;
export type PgTrans = PgTransaction<
  NodePgQueryResultHKT,
  SchemaT,
  ExtractTablesWithRelations<SchemaT>
>;
export const DrizzleAsyncProvider = 'drizzleProvider';

export async function dbConnect(
  connectionString: string,
): Promise<[DatabaseI, Client]> {
  const client = new Client({
    connectionString: connectionString,
  });
  await client.connect();
  const db: DatabaseI = drizzle(client, {
    schema: { ...schema, ...appStateSchema, ...ds_schema, ...relations },
    logger: false,
  });
  return [db, client];
}
