import { ConfigService } from '@nestjs/config';
import { TConfigService } from '../evn.validation';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema/schema';
import * as ds_schema from './schema/data_sources.schema';
import * as relations from './schema/relations';
import { PgTransaction, QueryResultHKT } from 'drizzle-orm/pg-core';

type schemaT = typeof schema & typeof ds_schema & typeof relations;
export type DatabaseI = NodePgDatabase<schemaT>;
export type PgTrans = PgTransaction<QueryResultHKT, schemaT>;

export const DrizzleAsyncProvider = 'drizzleProvider';

export async function dbConnect(
  connectionString: string,
): Promise<[DatabaseI, Client]> {
  const client = new Client({
    connectionString: connectionString,
  });
  await client.connect();
  const db: DatabaseI = drizzle(client, {
    schema: { ...schema, ...ds_schema, ...relations },
  });
  return [db, client];
}

export const drizzleProvider = {
  provide: DrizzleAsyncProvider,
  inject: [ConfigService],
  useFactory: async (configService: TConfigService) => {
    return (await dbConnect(configService.get('DB_URL')))[0];
  },
  exports: [DrizzleAsyncProvider],
};
