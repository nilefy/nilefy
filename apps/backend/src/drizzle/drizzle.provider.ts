import { ConfigService } from '@nestjs/config';
import { TConfigService } from '../evn.validation';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema/schema';
import * as appStateSchema from './schema/appsState.schema';
import { PgTransaction, QueryResultHKT } from 'drizzle-orm/pg-core';

export type DatabaseI = NodePgDatabase<typeof schema & typeof appStateSchema>;
export type PgTrans = PgTransaction<
  QueryResultHKT,
  typeof schema & typeof appStateSchema
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
    schema: { ...schema, ...appStateSchema },
    logger: true,
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
