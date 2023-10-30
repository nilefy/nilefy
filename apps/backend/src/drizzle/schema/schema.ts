import { relations, sql } from 'drizzle-orm';
import {
  integer,
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
  email: varchar('email', { length: 256 }).notNull(),
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

const userWorkspaceRelation = 'userWorkspaces';
const userAppRelation = 'userApps';
const workspaceAppsRelation = 'workspaceApps';
const userUpdateWorkspaceRelation = 'lastUpdatedWorkspaces';
const userDeleteWorkspaceRelation = 'lastDeletedWorkspaces';
const userUpdateAppRelation = 'lastUpdatedApps';
const userDeleteAppRelation = 'lastDeletedApps';

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
