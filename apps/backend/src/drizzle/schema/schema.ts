import { sql } from 'drizzle-orm';
import {
  integer,
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

export const apps = pgTable('apps', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  icon: text('icon'),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  ...timeStamps,
  ...softDelete,
});
