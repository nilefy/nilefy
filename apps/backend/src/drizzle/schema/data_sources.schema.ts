import { sql } from 'drizzle-orm';
import {
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  varchar,
  unique,
} from 'drizzle-orm/pg-core';
import { workspaces, users, timeStamps, apps } from './schema';

export const dataSourcesEnum = pgEnum('data_sources_enum', [
  'database',
  'api',
  'cloud storage',
  'plugin',
]);

export const dataSources = pgTable('data_sources', {
  id: serial('id').primaryKey(),
  type: dataSourcesEnum('type').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }),
  image: varchar('image_url'),
  /**
   * jsonschema for datasource configuration
   */
  config: json('config')
    .default(sql`'{}'::json`)
    .notNull(),
  /**
   * jsonschema for datasource's query configuration
   */
  queryConfig: json('query_config')
    .default(sql`'{}'::json`)
    .notNull(),
});

export const workspaceDataSources = pgTable(
  'workspace_data_sources',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    workspaceId: integer('workspace_id')
      .references(() => workspaces.id)
      .notNull(),
    dataSourceId: integer('data_source_id')
      .references(() => dataSources.id)
      .notNull(),
    /**
     * datasource configuration(evaluated, there will be no expressions in datasource config)
     */
    config: json('config')
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::json`)
      .notNull(),
    ...timeStamps,
    createdById: integer('created_by_id')
      .references(() => users.id)
      .notNull(),
    updatedById: integer('updated_by_id').references(() => users.id),
  },
  (t) => {
    return {
      unq: unique().on(t.workspaceId, t.dataSourceId, t.name),
    };
  },
);

export const queries = pgTable(
  'workspace_app_queries',
  {
    id: serial('id').primaryKey(),
    name: varchar('query_name', { length: 100 }).notNull(),
    /**
     * query **un-evaluated** configuration(cannot run query with this config, needs to get evaluated config from front-end)
     */
    query: json('query').$type<Record<string, unknown>>().notNull(),
    appId: integer('app_id')
      .references(() => apps.id)
      .notNull(),
    dataSourceId: integer('data_source_id')
      .references(() => workspaceDataSources.id, { onDelete: 'cascade' })
      .notNull(),
    createdById: integer('created_by_id')
      .references(() => users.id)
      .notNull(),
    updatedById: integer('updated_by_id').references(() => users.id),
    ...timeStamps,
  },
  (t) => ({
    nameUnique: unique().on(t.name, t.appId),
  }),
);
