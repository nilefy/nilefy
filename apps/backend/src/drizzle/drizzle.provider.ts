import { ConfigService } from '@nestjs/config';
import { TConfigService } from 'src/evn.validation';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema/schema';

export type DatabaseI = NodePgDatabase<typeof schema>;

export const DrizzleAsyncProvider = 'drizzleProvider';

export async function dbConnect(
  connectionString: string,
): Promise<[DatabaseI, Client]> {
  const client = new Client({
    connectionString: connectionString,
  });
  await client.connect();
  const db: DatabaseI = drizzle(client, { schema });
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
