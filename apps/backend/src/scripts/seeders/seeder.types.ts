import { InferInsertModel } from 'drizzle-orm';
import { DatabaseI } from '../../drizzle/drizzle.provider';
import { z } from 'zod';
import { dataSources as dataSourcesDrizzle } from '../../drizzle/schema/data_sources.schema';

export type SeederI<T> = (db: DatabaseI) => Promise<T>;

export const dataSourcesEnum = z.enum([
  'database',
  'api',
  'cloud storage',
  'plugin',
]);

export const dataSources = {
  database: ['postgresql', 'sql server', 'mysql', 'mongodb'],
  api: ['rest api', 'graphql', 'slack', 'notion'],
  'cloud storage': ['aws s3', 'azure blob storage'],
  plugin: ['github', 'open ai'],
};

export type DataSourceT = InferInsertModel<typeof dataSourcesDrizzle>;
