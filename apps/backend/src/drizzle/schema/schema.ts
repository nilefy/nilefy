import { relations, sql } from 'drizzle-orm';
import {
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * spread them to easy create createdAt and updatedAt fields
 */
export const timeStamps = {
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at'),
};

export const softDelete = {
  deletedAt: timestamp('deleted_at'),
};

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 256 }).notNull(),
  email: varchar('email', { length: 256 }).unique().notNull(),
  password: varchar('password', { length: 256 }).notNull(),
  ...timeStamps,
  ...softDelete,
});

export const workspaces = pgTable('workspaces', {
  id: serial('id').primaryKey(),
  /**
   * implicitly means the admin
   */
  createdById: integer('created_by_id')
    .references(() => users.id)
    .notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  imageUrl: text('imageUrl'),
  ...timeStamps,
  ...softDelete,
  updatedById: integer('updated_by_id').references(() => users.id),
  deletedById: integer('deleted_by_id').references(() => users.id),
});

export const apps = pgTable('apps', {
  id: serial('id').primaryKey(),
  createdById: integer('created_by_id')
    .references(() => users.id)
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }),
  state: json('state')
    .default(sql`'{}'::json`)
    .notNull(),
  /**
   * workspace this app belongs to
   */
  workspaceId: integer('workspace_id')
    .references(() => workspaces.id)
    .notNull(),
  ...timeStamps,
  ...softDelete,
  updatedById: integer('updated_by_id').references(() => users.id),
  deletedById: integer('deleted_by_id').references(() => users.id),
});

export const webloomTables = pgTable('tables', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  ...timeStamps,
  createdById: integer('created_by_id')
    .references(() => users.id)
    .notNull(),
  /**
   * workspace id this table belongs to
   */
  workspaceId: integer('workspace_id')
    .references(() => workspaces.id)
    .notNull(),
});

export const pgColumnTypsEnum = pgEnum('pg_columns_enum', [
  'varchar',
  'int',
  'bigint',
  'serial',
  'boolean',
]);

export const webloomColumns = pgTable('columns', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  type: pgColumnTypsEnum('type').notNull(),
  tableId: integer('table_id')
    .notNull()
    .references(() => webloomTables.id, { onDelete: 'cascade' }),
});

const userWorkspaceRelation = 'userWorkspaces';
const userAppRelation = 'userApps';
const userWebloomTablesRelation = 'userTables';
const workspaceAppsRelation = 'workspaceApps';
const workspaceWebloomTablesRelation = 'workspaceWebloomTables';
const userUpdateWorkspaceRelation = 'lastUpdatedWorkspaces';
const userDeleteWorkspaceRelation = 'lastDeletedWorkspaces';
const userUpdateAppRelation = 'lastUpdatedApps';
const userDeleteAppRelation = 'lastDeletedApps';
const webloomTablesColumnsRelation = 'webloomTablesColumns';

export const usersRelations = relations(users, ({ many }) => {
  return {
    lastUpdatedWorkspaces: many(workspaces, {
      relationName: userUpdateWorkspaceRelation,
    }),
    lastDeletedWorkspaces: many(workspaces, {
      relationName: userDeleteWorkspaceRelation,
    }),
    lastUpdatedApps: many(apps, {
      relationName: userUpdateAppRelation,
    }),
    lastDeletedApps: many(apps, {
      relationName: userDeleteAppRelation,
    }),
    /**
     * workspaces user created/own
     */
    workspaces: many(workspaces, { relationName: userWorkspaceRelation }),
    /**
     * Apps user created/own
     */
    apps: many(apps, { relationName: userAppRelation }),
    /**
     * webloom tables user created/own
     */
    webloomTables: many(webloomTables, {
      relationName: userWebloomTablesRelation,
    }),
  };
});

export const workspacesRelations = relations(workspaces, ({ many, one }) => ({
  createdBy: one(users, {
    fields: [workspaces.createdById],
    references: [users.id],
    relationName: userWorkspaceRelation,
  }),
  updatedBy: one(users, {
    fields: [workspaces.updatedById],
    references: [users.id],
    relationName: userUpdateWorkspaceRelation,
  }),
  deletedBy: one(users, {
    fields: [workspaces.deletedById],
    references: [users.id],
    relationName: userDeleteWorkspaceRelation,
  }),
  apps: many(apps, { relationName: workspaceAppsRelation }),
  webloomTables: many(webloomTables, {
    relationName: workspaceWebloomTablesRelation,
  }),
}));

export const appsRelations = relations(apps, ({ one }) => ({
  createdBy: one(users, {
    fields: [apps.createdById],
    references: [users.id],
    relationName: userAppRelation,
  }),
  updatedBy: one(users, {
    fields: [apps.updatedById],
    references: [users.id],
    relationName: userUpdateAppRelation,
  }),
  deletedBy: one(users, {
    fields: [apps.deletedById],
    references: [users.id],
    relationName: userDeleteAppRelation,
  }),
  workspace: one(workspaces, {
    fields: [apps.workspaceId],
    references: [workspaces.id],
    relationName: workspaceAppsRelation,
  }),
}));

export const webloomTableRelations = relations(
  webloomTables,
  ({ one, many }) => ({
    columns: many(webloomColumns, {
      relationName: webloomTablesColumnsRelation,
    }),
    createdBy: one(users, {
      fields: [webloomTables.createdById],
      references: [users.id],
      relationName: userWebloomTablesRelation,
    }),
    workspace: one(workspaces, {
      fields: [webloomTables.workspaceId],
      references: [workspaces.id],
      relationName: workspaceWebloomTablesRelation,
    }),
  }),
);

export const webloomColumnRelations = relations(webloomColumns, ({ one }) => ({
  tableId: one(webloomTables, {
    fields: [webloomColumns.tableId],
    references: [webloomTables.id],
    relationName: webloomTablesColumnsRelation,
  }),
}));
