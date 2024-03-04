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
  database: ['PostgreSQL', 'SQL Server', 'MySQL', 'MongoDB', 'BigQuery'],
  api: ['REST API', 'GraphQL', 'Slack', 'Notion', 'Google Sheets', 'OpenAPI'],
  'cloud storage': ['AWS S3', 'Azure Blob Storage', 'Google Cloud Storage'],
  plugin: ['GitHub', 'openai'],
};

export type DataSourceT = InferInsertModel<typeof dataSourcesDrizzle>;
