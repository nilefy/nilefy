import { InferInsertModel } from 'drizzle-orm';
import { z } from 'zod';
import { dataSources as dataSourcesDrizzle } from '@webloom/database';
import { DatabaseI } from '@webloom/database';

export type SeederI<T> = (db: DatabaseI) => Promise<T>;

export const dataSourcesEnum = z.enum([
  'database',
  'api',
  'cloud storage',
  'plugin',
]);

export const dataSources = {
  database: ['PostgreSQL'],
  api: ['REST API'],
  'cloud storage': ['Azure Blob Storage', 'Google Cloud Storage'],
  plugin: [],
};

export type DataSourceT = InferInsertModel<typeof dataSourcesDrizzle>;
