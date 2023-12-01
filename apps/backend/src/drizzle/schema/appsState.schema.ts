import { relations, sql } from 'drizzle-orm';
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
import {
  apps,
  timeStamps,
  softDelete,
  whoToBlame,
  users,
  workspaces,
} from './schema';
import { WebloomNode } from '../../dto/apps.dto';

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
    id: text('id').notNull(),
    name: varchar('name').notNull(),
    type: varchar('type').notNull(),
    // TODO: convert to jsonb
    props: json('props').$type<WebloomNode['props']>().notNull(),
    /**
     * parent_id
     */
    parent: text('parent_id'),
    isCanvas: boolean('is_canvas'),
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
      columns: [t.parent],
      foreignColumns: [t.id],
    }).onDelete('cascade'),
  }),
);

const pagesToappsRelation = 'pagesinapp';
const componentsToPageRelation = 'componentsToPage';
const componentParentRelation = 'componentParent';

const userAppRelation = 'userApps';
// workspaces
const workspaceAppsRelation = 'workspaceApps';
const userUpdateAppRelation = 'lastUpdatedApps';
const userDeleteAppRelation = 'DeletedApps';

// export const pagesToAppsRelations = relations(apps, ({ many }) => {
//   return {
//   };
// });

export const appsRelations = relations(apps, ({ many, one }) => ({
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
  pages: many(pages, {
    relationName: pagesToappsRelation,
  }),
}));

export const pagesRelations = relations(pages, ({ many, one }) => {
  return {
    app: one(apps, {
      fields: [pages.appId],
      references: [apps.id],
      relationName: pagesToappsRelation,
    }),
    components: many(components, {
      relationName: componentsToPageRelation,
    }),
  };
});

export const componentsRelations = relations(components, ({ one, many }) => ({
  page: one(pages, {
    fields: [components.pageId],
    references: [pages.id],
    relationName: componentsToPageRelation,
  }),
  parent: one(components, {
    fields: [components.parent],
    references: [components.id],
    relationName: componentParentRelation,
  }),
  children: many(components, {
    relationName: componentParentRelation,
  }),
}));
