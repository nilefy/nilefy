import { sql } from 'drizzle-orm';
import {
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  varchar,
  unique,
  text,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { workspaces, users, timeStamps, apps } from './schema';
import { dataSourcesTypes } from '@webloom/constants';

export const dataSourcesEnum = pgEnum('data_sources_enum', dataSourcesTypes);

export const dataSources = pgTable('data_sources', {
  id: serial('id').primaryKey(),
  type: dataSourcesEnum('type').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }),
  image: varchar('image_url'),
  /**
   * @description jsonschema/uiSchema for datasource configuration
   * @type {schema: RJSFSchema, uiSchema: UISchema}
   */
  config: json('config').notNull(),
  /**
   * @description jsonschema/uiSchema for datasource's query configuration
   * @type {schema: RJSFSchema, uiSchema: UISchema}
   */
  queryConfig: json('query_config').notNull(),
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

export const queriesTriggerMode = pgEnum('queries_trigger_mode', [
  'manually',
  'onAppLoad',
]);

export const queries = pgTable(
  'workspace_app_queries',
  {
    /**
     * id now act as name as well as id
     */
    id: text('id').notNull(),
    /**
     * query **un-evaluated** configuration(cannot run query with this config, needs to get the evaluated config the from front-end)
     */
    query: json('query').$type<Record<string, unknown>>().notNull(),
    triggerMode: queriesTriggerMode('trigger_mode')
      .default('manually')
      .notNull(),
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
    pk: primaryKey({ columns: [t.id, t.appId] }),
  }),
);

export const jsQueries = pgTable(
  'app_js_queries',
  {
    /**
     * id now act as name as well as id
     */
    id: text('id').notNull(),
    appId: integer('app_id')
      .references(() => apps.id)
      .notNull(),
    /**
     * query **un-evaluated** configuration(cannot run query with this config, needs to get the evaluated config the from front-end)
     */
    query: text('query'),
    /**
     * for now used to handle any un-strucutred meta data like events handlers
     * this should be improved in the future by extracting the structured data out of it, but i think it will make the trick for now
     */
    settings: json('settings'),
    createdById: integer('created_by_id')
      .references(() => users.id)
      .notNull(),
    updatedById: integer('updated_by_id').references(() => users.id),
    ...timeStamps,
  },
  (t) => ({
    pk: primaryKey({ columns: [t.id, t.appId] }),
  }),
);
