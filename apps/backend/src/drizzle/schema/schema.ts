import { sql } from 'drizzle-orm';
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
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
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
    pk: primaryKey({ columns: [t.roleId, t.userId] }),
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
    pk: primaryKey({ columns: [t.userId, t.workspaceId] }),
  }),
);

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
