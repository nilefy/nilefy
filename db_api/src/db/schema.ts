import { serial, text, pgTable, timestamp,  json} from 'drizzle-orm/pg-core';

export const tables = pgTable('tables', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().default('**del**'),
  created_at: timestamp('created_at', {
    withTimezone: true,
  } ).defaultNow(),
  columns: json('columns').notNull(),
});

export const tableRelation = pgTable('table_relation', {});

export const column = pgTable('column', {
  id: serial('id').primaryKey(),
  name: text('name'),
  // the following is a list of columns where column is another entity.

  // tables: ,
});
