import { relations } from 'drizzle-orm';
import {
  users,
  workspaces,
  apps,
  webloomTables,
  webloomColumns,
  usersToRoles,
  usersToWorkspaces,
  permissions,
  permissionsToRoles,
  roles,
} from './schema';
import {
  workspaceDataSources,
  dataSources,
  queries,
} from './data_sources.schema';
import { components, pages } from './appsState.schema';

// to remove Disambiguating relations
// @link https://orm.drizzle.team/docs/rqb#disambiguating-relations
// users
const userWorkspaceRelation = 'userWorkspaces';
const userAppRelation = 'userApps';
const userWebloomTablesRelation = 'userTables';
const userUserInWorkspacesRelation = 'userworkspaceUsers';
const workspaceUserInWorkspacesRelation = 'workspaceworkspaceUsers';
// workspaces
const workspaceAppsRelation = 'workspaceApps';
const workspaceWebloomTablesRelation = 'workspaceWebloomTables';
const userUpdateWorkspaceRelation = 'lastUpdatedWorkspaces';
const userDeleteWorkspaceRelation = 'DeletedWorkspaces';
const userUpdateAppRelation = 'lastUpdatedApps';
const userDeleteAppRelation = 'DeletedApps';
const webloomTablesColumnsRelation = 'webloomTablesColumns';
// groups
// const userUsersInGroupRelation = 'useruserInGroup';
// const groupUsersInGroupRelation = 'groupuserInGroup';
// const groupGroupRolesRelation = 'groupgroupRoles';
// const roleGroupRolesRelation = 'rolegroupRoles';
// roles
const userUsersInRoleRelation = 'userUsersInRole';
const roleUsersInRoleRelation = 'roleUsersInRole';
const workspaceRolesRelation = 'workspaceRoles';
// permissions
const permissionPermissionsInRoleRelation = 'permissionpermissionsInRole';
const rolePermissionsInRoleRelation = 'rolepermissionsInRole';

// apps
const pagesToappsRelation = 'pagesinapp';

const dataSourceWorkspaceRelation = 'dataSource';
const workspaceDataSourcesRelation = 'workspaceDataSources';
const userDataSourceRelation = 'userDataSource';
const userUpdateDataSourceRelation = 'lastUpdatedDataSource';
const userDeleteDataSourceRelation = 'lastDeletedDataSource';
const userQueriesRelation = 'userQueries';
const appQueriesRelation = 'appQueries';
const wsDataSourceQueriesRelation = 'dataSourceQueriesRelation';
const componentsToPageRelation = 'componentsToPage';
const componentParentRelation = 'componentParent';

export const usersRelations = relations(users, ({ many }) => {
  return {
    lastUpdatedWorkspaces: many(workspaces, {
      relationName: userUpdateWorkspaceRelation,
    }),
    DeletedWorkspaces: many(workspaces, {
      relationName: userDeleteWorkspaceRelation,
    }),
    lastUpdatedApps: many(apps, {
      relationName: userUpdateAppRelation,
    }),
    DeletedApps: many(apps, {
      relationName: userDeleteAppRelation,
    }),
    /**
     * workspaces user created/own
     */
    ownedWorkspaces: many(workspaces, { relationName: userWorkspaceRelation }),
    /**
     * workspaces user is in
     */
    workspaces: many(usersToWorkspaces, {
      relationName: userUserInWorkspacesRelation,
    }),
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
    // usersToGroups: many(usersToGroups, {
    //   relationName: userUsersInGroupRelation,
    // }),
    // roles
    usersToRoles: many(usersToRoles, { relationName: userUsersInRoleRelation }),

    lastDeletedWorkspaces: many(workspaces, {
      relationName: userDeleteWorkspaceRelation,
    }),
    lastUpdatedDataSources: many(workspaceDataSources, {
      relationName: userUpdateDataSourceRelation,
    }),
    lastDeletedDataSources: many(workspaceDataSources, {
      relationName: userDeleteDataSourceRelation,
    }),
    // data sources user created
    dataSources: many(workspaceDataSources, {
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
  apps: many(apps, { relationName: workspaceAppsRelation }),
  webloomTables: many(webloomTables, {
    relationName: workspaceWebloomTablesRelation,
  }),
  /**
   * users in the workspace
   */
  uesrs: many(usersToWorkspaces, {
    relationName: workspaceUserInWorkspacesRelation,
  }),

  dataSources: many(workspaceDataSources, {
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
  pages: many(pages, {
    relationName: pagesToappsRelation,
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
 * one ws data source - many queries
 */
export const queriesRelations = relations(queries, ({ one }) => ({
  createdBy: one(users, {
    fields: [queries.createdById],
    references: [users.id],
    relationName: userQueriesRelation,
  }),
  app: one(apps, {
    fields: [queries.appId],
    references: [apps.id],
    relationName: appQueriesRelation,
  }),
  dataSource: one(workspaceDataSources, {
    fields: [queries.dataSourceId],
    references: [workspaceDataSources.id],
    relationName: wsDataSourceQueriesRelation,
  }),
}));

export const workspaceDataSourcesRelations = relations(
  workspaceDataSources,
  ({ one, many }) => ({
    createdBy: one(users, {
      fields: [workspaceDataSources.createdById],
      references: [users.id],
      relationName: userDataSourceRelation,
    }),
    updatedBy: one(users, {
      fields: [workspaceDataSources.updatedById],
      references: [users.id],
      relationName: userUpdateDataSourceRelation,
    }),
    deletedBy: one(users, {
      fields: [workspaceDataSources.deletedById],
      references: [users.id],
      relationName: userDeleteDataSourceRelation,
    }),
    workspace: one(workspaces, {
      fields: [workspaceDataSources.workspaceId],
      references: [workspaces.id],
      relationName: workspaceDataSourcesRelation,
    }),
    dataSource: one(dataSources, {
      fields: [workspaceDataSources.dataSourceId],
      references: [dataSources.id],
      relationName: dataSourceWorkspaceRelation,
    }),
    dataSourceQueries: many(queries, {
      relationName: wsDataSourceQueriesRelation,
    }),
  }),
);

export const dataSourcesRelations = relations(dataSources, ({ many }) => ({
  workspaceDataSource: many(workspaceDataSources, {
    relationName: dataSourceWorkspaceRelation,
  }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  permissionsToRoles: many(permissionsToRoles, {
    relationName: permissionPermissionsInRoleRelation,
  }),
}));

// export const groupsRelations = relations(groups, ({ many }) => ({
//   usersToGroups: many(usersToGroups, {
//     relationName: groupUsersInGroupRelation,
//   }),
//   rolesToGroups: many(rolesToGroups, { relationName: groupGroupRolesRelation }),
// }));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  permissionsToRoles: many(permissionsToRoles, {
    relationName: rolePermissionsInRoleRelation,
  }),
  usersToRoles: many(usersToRoles, { relationName: roleUsersInRoleRelation }),
  // rolesToGroups: many(rolesToGroups, { relationName: roleGroupRolesRelation }),
  workspace: one(workspaces, {
    fields: [roles.workspaceId],
    references: [workspaces.id],
    relationName: workspaceRolesRelation,
  }),
}));

// export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
//   group: one(groups, {
//     fields: [usersToGroups.groupId],
//     references: [groups.id],
//     relationName: groupUsersInGroupRelation,
//   }),
//   user: one(users, {
//     fields: [usersToGroups.userId],
//     references: [users.id],
//     relationName: userUsersInGroupRelation,
//   }),
// }));

export const permissionsToRolesRelations = relations(
  permissionsToRoles,
  ({ one }) => ({
    permission: one(permissions, {
      fields: [permissionsToRoles.permissionId],
      references: [permissions.id],
      relationName: permissionPermissionsInRoleRelation,
    }),
    role: one(roles, {
      fields: [permissionsToRoles.roleId],
      references: [roles.id],
      relationName: rolePermissionsInRoleRelation,
    }),
  }),
);

export const usersToRolesRelations = relations(usersToRoles, ({ one }) => ({
  role: one(roles, {
    fields: [usersToRoles.roleId],
    references: [roles.id],
    relationName: roleUsersInRoleRelation,
  }),
  user: one(users, {
    fields: [usersToRoles.userId],
    references: [users.id],
    relationName: userUsersInRoleRelation,
  }),
}));

// export const rolesToGroupsRelations = relations(rolesToGroups, ({ one }) => ({
//   group: one(groups, {
//     fields: [rolesToGroups.groupId],
//     references: [groups.id],
//     relationName: groupGroupRolesRelation,
//   }),
//   role: one(roles, {
//     fields: [rolesToGroups.roleId],
//     references: [roles.id],
//     relationName: roleGroupRolesRelation,
//   }),
// }));

export const usersToWorkspacesRelations = relations(
  usersToWorkspaces,
  ({ one }) => ({
    user: one(users, {
      fields: [usersToWorkspaces.userId],
      references: [users.id],
      relationName: userUserInWorkspacesRelation,
    }),
    workspace: one(workspaces, {
      fields: [usersToWorkspaces.workspaceId],
      references: [workspaces.id],
      relationName: workspaceUserInWorkspacesRelation,
    }),
  }),
);

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
