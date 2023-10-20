import { ConfigService } from '@nestjs/config';
import { TConfigService } from 'src/evn.validation';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema/schema';

export type DatabaseI = NodePgDatabase<typeof schema>;

export const drizzleProvider = [
  {
    provide: 'drizzle',
    inject: [ConfigService],
    useFactory: async (configService: TConfigService) => {
      const client = new Client({
        connectionString: configService.get('DB_URL'),
      });
      await client.connect();
      const db: DatabaseI = drizzle(client, { schema });
      return db;
    },
    exports: ['drizzle'],
  },
];
