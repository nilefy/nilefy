import { InferInsertModel } from 'drizzle-orm';
import { z } from 'zod';
import { dataSources as dataSourcesDrizzle } from '@nilefy/database';
import { DatabaseI } from '@nilefy/database';

export type SeederI<T> = (db: DatabaseI, count: number) => Promise<T>;

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
