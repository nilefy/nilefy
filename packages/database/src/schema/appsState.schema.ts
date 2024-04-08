import { sql } from 'drizzle-orm';
import {
  integer,
  json,
  pgTable,
  serial,
  varchar,
  unique,
  foreignKey,
  boolean,
  text,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { apps, timeStamps, softDelete, whoToBlame } from './schema';

/**
 * any app contains multiple pages, each page have a seprate `tree`/`state`
 * components represents tree state of the page
 *
 * app has multiple pages(one to many)
 * page has one tree(multiple components)(one to many)
 * components have self relation to create tree
 */

export const pages = pgTable(
  'pages',
  {
    id: serial('id').primaryKey(),
    handle: varchar('handle').notNull(),
    name: varchar('name').notNull(),
    enabled: boolean('disabled')
      .notNull()
      .default(sql`true`),
    visible: boolean('visible')
      .notNull()
      .default(sql`true`),
    index: integer('index').notNull(),
    appId: integer('app_id')
      .notNull()
      .references(() => apps.id),
    ...timeStamps,
    ...softDelete,
    ...whoToBlame,
  },
  (t) => ({
    pageName: unique().on(t.appId, t.name),
    handleUnique: unique().on(t.appId, t.handle),
  }),
);

export const components = pgTable(
  'components',
  {
    /**
     * id now act as name as well as id
     */
    id: text('id').notNull(),
    type: varchar('type').notNull(),
    // TODO: convert to jsonb
    props: json('props').$type<Record<string,unknown>>().notNull(),
    /**
     * parent_id
     */
    parentId: text('parent_id'),
    // LAYOUT
    /**
     * columnNumber from left to right starting from 0 to NUMBER_OF_COLUMNS
     */
    col: integer('col').notNull(),
    /**
     * rowNumber from top to bottom starting from 0 to infinity
     */
    row: integer('row').notNull(),
    // number of columns this node takes
    columnsCount: integer('columns_count').notNull(),
    /**
     * number of rows this node takes
     */
    rowsCount: integer('rows_count').notNull(),
    pageId: integer('page_id')
      .notNull()
      .references(() => pages.id),
    ...timeStamps,
    ...whoToBlame,
  },
  (t) => ({
    pk: primaryKey({ columns: [t.id, t.pageId] }),
    parentFK: foreignKey({
      columns: [t.parentId, t.pageId],
      foreignColumns: [t.id, t.pageId],
    }).onDelete('cascade'),
  }),
);

// export const pagesToAppsRelations = relations(apps, ({ many }) => {
//   return {
//   };
// });
