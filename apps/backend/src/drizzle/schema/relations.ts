import { relations } from 'drizzle-orm';
import {
  users,
  workspaces,
  apps,
  webloomTables,
  webloomColumns,
} from './schema';
import {
  dataSources,
  availableDataSources,
  queries,
} from './data_sources.schema';

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
const availableDataSourcesRelation = 'dataSource';
const workspaceDataSourcesRelation = 'workspaceDataSources';
const userDataSourceRelation = 'userDataSource';
const userUpdateDataSourceRelation = 'lastUpdatedDataSource';
const userDeleteDataSourceRelation = 'lastDeletedDataSource';
const userQueriesRelation = 'userQueries';
const appQueriesRelation = 'appQueries';
const dataSourceQueriesRelation = 'dataSourceQueriesRelation';

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
    lastUpdatedDataSources: many(dataSources, {
      relationName: userUpdateDataSourceRelation,
    }),
    lastDeletedDataSources: many(dataSources, {
      relationName: userDeleteDataSourceRelation,
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
    // data sources user created
    dataSources: many(dataSources, {
      relationName: userDataSourceRelation,
    }),
    // queries user created
    queries: many(queries, {
      relationName: userQueriesRelation,
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
  apps: many(apps, {
    relationName: workspaceAppsRelation,
  }),
  webloomTables: many(webloomTables, {
    relationName: workspaceWebloomTablesRelation,
  }),
  dataSources: many(dataSources, {
    relationName: workspaceDataSourcesRelation,
  }),
}));

export const appsRelations = relations(apps, ({ one, many }) => ({
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
  queries: many(queries, {
    relationName: appQueriesRelation,
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

/**
 * one app - many queries
 * one user - many queries
 * one data source - many queries
 */
export const queriesRelations = relations(queries, ({ one }) => ({
  createdBy: one(users, {
    fields: [queries.userId],
    references: [users.id],
    relationName: userQueriesRelation,
  }),
  app: one(apps, {
    fields: [queries.appId],
    references: [apps.id],
    relationName: appQueriesRelation,
  }),
  dataSource: one(availableDataSources, {
    fields: [queries.dataSourceId],
    references: [availableDataSources.id],
    relationName: dataSourceQueriesRelation,
  }),
}));

export const dataSourcesRelations = relations(dataSources, ({ one }) => ({
  createdBy: one(users, {
    fields: [dataSources.createdById],
    references: [users.id],
    relationName: userDataSourceRelation,
  }),
  updatedBy: one(users, {
    fields: [dataSources.updatedById],
    references: [users.id],
    relationName: userUpdateDataSourceRelation,
  }),
  deletedBy: one(users, {
    fields: [dataSources.deletedById],
    references: [users.id],
    relationName: userDeleteDataSourceRelation,
  }),
  workspace: one(workspaces, {
    fields: [dataSources.workspaceId],
    references: [workspaces.id],
    relationName: workspaceDataSourcesRelation,
  }),
  dataSource: one(availableDataSources, {
    fields: [dataSources.dataSourceId],
    references: [availableDataSources.id],
    relationName: availableDataSourcesRelation,
  }),
}));

export const availableDataSourcesRelations = relations(
  availableDataSources,
  ({ many }) => ({
    workspaceDataSource: many(dataSources, {
      relationName: availableDataSourcesRelation,
    }),
    dataSourceQueries: many(queries, {
      relationName: dataSourceQueriesRelation,
    }),
  }),
);
