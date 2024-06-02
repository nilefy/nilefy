import { InferInsertModel } from 'drizzle-orm';
import { z } from 'zod';
import { dataSources as dataSourcesDrizzle } from '@nilefy/database';
import { PgTrans } from '@nilefy/database';
import { INestApplicationContext } from '@nestjs/common';

export type SeederI<T> = (
  nest: INestApplicationContext,
  db: PgTrans,
  count: number,
) => Promise<T>;

export const dataSourcesEnum = z.enum([
  'database',
  'api',
  'cloud storage',
  'plugin',
]);

export const dataSources = {
  database: ['PostgreSQL', 'MongoDB'],
  api: ['REST API'],
  'cloud storage': ['Azure Blob Storage', 'Google Cloud Storage'],
  plugin: [],
};

export type DataSourceT = InferInsertModel<typeof dataSourcesDrizzle>;
