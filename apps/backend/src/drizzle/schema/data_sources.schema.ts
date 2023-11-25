import { sql } from 'drizzle-orm';
import {
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { workspaces, users, timeStamps, softDelete, apps } from './schema';

export const dataSourcesEnum = pgEnum('data_sources_enum', [
  'database',
  'api',
  'cloud storage',
  'plugin',
]);

export const availableDataSources = pgTable('available_data_sources', {
  id: serial('id').primaryKey(),
  type: dataSourcesEnum('type').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }),
  image: varchar('image_url'),
  config: json('config')
    .default(sql`'{}'::json`)
    .notNull(),
});

export const dataSources = pgTable(
  'workspace_data_sources',
  {
    name: varchar('name', { length: 100 }).notNull(),
    workspaceId: integer('workspace_id')
      .references(() => workspaces.id)
      .notNull(),
    dataSourceId: integer('data_source_id')
      .references(() => availableDataSources.id)
      .notNull(),
    config: json('config')
      .default(sql`'{}'::json`)
      .notNull(),
    ...timeStamps,
    ...softDelete,
    createdById: integer('created_by_id')
      .references(() => users.id)
      .notNull(),
    updatedById: integer('updated_by_id').references(() => users.id),
    deletedById: integer('deleted_by_id').references(() => users.id),
  },
  (t) => {
    return {
      pk: primaryKey(t.workspaceId, t.dataSourceId, t.name),
    };
  },
);

export const queries = pgTable(
  'workspace_app_queries',
  {
    name: varchar('query_name', { length: 100 }).unique().notNull(),
    query: varchar('query', { length: 255 }).notNull(),
    workspaceId: integer('workspace_id')
      .references(() => workspaces.id)
      .notNull(),
    appId: integer('app_id')
      .references(() => apps.id)
      .notNull(),
    dataSourceId: integer('data_source_id')
      .references(() => availableDataSources.id)
      .notNull(),
    dataSourceName: varchar('data_source_name', { length: 100 })
      .references(() => dataSources.name)
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
  },
  (t) => ({
    pk: primaryKey(t.workspaceId, t.appId, t.dataSourceName),
  }),
);
