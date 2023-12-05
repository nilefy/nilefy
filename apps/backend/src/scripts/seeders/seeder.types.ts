import { DatabaseI } from '../../drizzle/drizzle.provider';
import { DataSourceDto } from '../../dto/data_sources.dto';
import { z } from 'zod';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';
import { PostgresqlConfigT } from '@webloom/data-sources';

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

export type DataSourceT = Omit<DataSourceDto, 'id'>;

export type ConfigT = WidgetInspectorConfig<PostgresqlConfigT>;
