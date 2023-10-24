import { sql } from 'drizzle-orm';
import {
  json,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * spreading them to easy create createdAt and updatedAt fields
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
  name: varchar('name', { length: 256 }).notNull(),
  imageUrl: text('imageUrl'),
  ...timeStamps,
  ...softDelete,
});

export const tablescx = pgTable('tables', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().default('**del**'),
  created_at: timestamp('created_at', {
    withTimezone: true,
  }).defaultNow(),
  columns: json('columns').notNull(),
});

export const tableRelation = pgTable('table_relation', {});

export const columncx = pgTable('column', {
  id: serial('id').primaryKey(),
  name: text('name'),
  // the following is a list of columns where column is another entity.

  // tables: ,
});
