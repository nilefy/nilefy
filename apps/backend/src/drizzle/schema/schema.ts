import { relations, sql } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  unique,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { permissionTypes } from '../../dto/permissionsTypes';

/**
 * spread them to easy create createdAt and updatedAt fields
 */
export const timeStamps = {
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at'),
};

/**
 *  spread to create `created_by_id` `updated_by_id` `deleted_by_id`
 */
export const whoToBlame = {
  createdById: integer('created_by_id')
    .references(() => users.id)
    .notNull(),
  updatedById: integer('updated_by_id').references(() => users.id),
  deletedById: integer('deleted_by_id').references(() => users.id),
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

/**
 * group could have more than one user, user could be in more than one group => many to many relation between users and groups
 *
 * group could have more than one role, role could be in more than one group => many to many relation between roles and groups
 */
// export const groups = pgTable('groups', {
//   id: serial('id').primaryKey(),
//   name: varchar('name', { length: 256 }).notNull(),
//   description: varchar('description', { length: 255 }),
//   ...timeStamps,
//   createdById: integer('created_by_id')
//     .references(() => users.id)
//     .notNull(),
//   updatedById: integer('updated_by_id').references(() => users.id),
//   deletedById: integer('deleted_by_id').references(() => users.id),
// });

// export const usersToGroups = pgTable(
//   'users_to_groups',
//   {
//     userId: integer('user_id')
//       .notNull()
//       .references(() => users.id),
//     groupId: integer('group_id')
//       .notNull()
//       .references(() => groups.id),
//   },
//   (t) => ({
//     pk: primaryKey(t.userId, t.groupId),
//   }),
// );

export const pgPermissionsEnum = pgEnum(
  'permissions_enum',
  permissionTypes.options,
);

export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  name: pgPermissionsEnum('name').unique().notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
});

/**
 * role could have more than one permission, permission could be in more than one role => many to many relation between permissions and roles
 *
 * role could have more than one user, user could be in more than one role => many to many relation between users and roles
 *
 * group could have more than one role, role could be in more than one group => many to many relation between roles and groups
 */
export const roles = pgTable(
  'roles',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    description: varchar('description', { length: 255 }),
    /**
     * workspace this role belongs to
     */
    workspaceId: integer('workspace_id')
      .references(() => workspaces.id)
      .notNull(),
    ...timeStamps,
    ...softDelete,
    ...whoToBlame,
  },
  (t) => ({
    // role name must be unique by workspace
    roleNameUnique: unique().on(t.workspaceId, t.name),
  }),
);

export const permissionsToRoles = pgTable(
  'permissions_to_roles',
  {
    permissionId: integer('permission_id')
      .notNull()
      .references(() => permissions.id),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id),
  },
  (t) => ({
    pk: primaryKey(t.roleId, t.permissionId),
  }),
);

export const usersToRoles = pgTable(
  'users_to_roles',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id),
  },
  (t) => ({
    pk: primaryKey(t.roleId, t.userId),
  }),
);

// export const rolesToGroups = pgTable(
//   'roles_to_groups',
//   {
//     groupId: integer('group_id')
//       .notNull()
//       .references(() => groups.id),
//     roleId: integer('role_id')
//       .notNull()
//       .references(() => roles.id),
//   },
//   (t) => ({
//     pk: primaryKey(t.roleId, t.groupId),
//   }),
// );

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

export const usersToWorkspaces = pgTable(
  'users_to_workspaces',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    workspaceId: integer('workspace_id')
      .notNull()
      .references(() => workspaces.id),
  },
  (t) => ({
    pk: primaryKey(t.userId, t.workspaceId),
  }),
);

export const apps = pgTable('apps', {
  id: serial('id').primaryKey(),
  createdById: integer('created_by_id')
    .references(() => users.id)
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: varchar('description', { length: 255 }),
  homepageId: integer('homepage_id').default(0),
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

export const webloomColumns = pgTable(
  'columns',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    type: pgColumnTypsEnum('type').notNull(),
    tableId: integer('table_id')
      .notNull()
      .references(() => webloomTables.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    name: unique().on(t.tableId, t.name),
  }),
);

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
  };
});

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
}));

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
