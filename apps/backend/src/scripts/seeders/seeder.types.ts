import { DatabaseI } from '../../drizzle/drizzle.provider';
import { z } from 'zod';

export type SeederI<T> = (db: DatabaseI) => Promise<T>;

export const dataSourcesEnum = z.enum([
  'database',
  'api',
  'cloud storage',
  'plugin',
]);

export const dataSources = {
  database: ['postqresql', 'sql server', 'mysql', 'mongodb'],
  api: ['rest api', 'graphql', 'slack', 'notion'],
  'cloud storage': ['aws s3', 'azure blob'],
  plugin: ['github', 'open ai'],
};
