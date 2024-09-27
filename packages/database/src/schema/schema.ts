import { sql } from "drizzle-orm";
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
  customType,
} from "drizzle-orm/pg-core";
import { permissionsTypes } from "@nilefy/permissions";
import { boolean } from "drizzle-orm/pg-core";
import type {
  AuthenticatorTransportFuture,
  CredentialDeviceType,
  Base64URLString,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/types";
import { bigint } from "drizzle-orm/pg-core";
import { json } from "drizzle-orm/pg-core";

const bytea = customType<{ data: Uint8Array; notNull: false; default: false }>({
  dataType() {
    return "bytea";
  },
  toDriver(val) {
    return Buffer.from(val);
  },
  fromDriver(val) {
    console.log("from driver", val, typeof val);
    // @ts-expect-error i will fix this error promise
    return new Uint8Array(val);
  },
});

/**
 * spread them to easy create createdAt and updatedAt fields
 */
export const timeStamps = {
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at"),
};

/**
 *  spread to create `created_by_id` `updated_by_id` `deleted_by_id`
 */
export const whoToBlame = {
  createdById: integer("created_by_id")
    .references(() => users.id)
    .notNull(),
  updatedById: integer("updated_by_id").references(() => users.id),
  deletedById: integer("deleted_by_id").references(() => users.id),
};

export const softDelete = {
  deletedAt: timestamp("deleted_at"),
};

export const userStatusEnum = pgEnum("user_status_enum", [
  /**
   * means this user can login, this user was created from normal sign up workflow, or have been invited and accepted the invite and configured their account
   */
  "active",
  /**
   * this user was not part of nilefy but has been invited by some workspace and cannot sign in uless the account is configured probably by either accepting the invite or go through normal sign up flow
   */
  "invited",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 256 }).notNull(),
  email: varchar("email", { length: 256 }).unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  password: varchar("password", { length: 256 }),
  avatar: text("avatar"),
  conformationToken: varchar("conformation_token", {
    length: 256,
  }),
  passwordResetToken: varchar("password_reset_token", {
    length: 256,
  }),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  status: userStatusEnum("status").default("active").notNull(),
  currentRegistrationOptions: json(
    "current_registration_options",
  ).$type<PublicKeyCredentialCreationOptionsJSON>(),
  currentAuthenticationOptions: json(
    "current_authentication_options",
  ).$type<PublicKeyCredentialRequestOptionsJSON>(),
  ...timeStamps,
  ...softDelete,
});

export const accounts = pgTable(
  "accounts",
  {
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

// this schema is recommended by https://simplewebauthn.dev/docs/packages/server#1-generate-registration-options
/**
 * It is strongly advised that credentials get their own DB
 * table, ideally with a foreign key somewhere connecting it
 * to a specific UserModel.
 *
 * "SQL" tags below are suggestions for column data types and
 * how best to store data received during registration for use
 * in subsequent authentications.
 */
export type Passkey = {
  // SQL: Store as `TEXT`. Index this column
  id: Base64URLString;
  // SQL: Store raw bytes as `BYTEA`/`BLOB`/etc...
  //      Caution: Node ORM's may map this to a Buffer on retrieval,
  //      convert to Uint8Array as necessary
  publicKey: Uint8Array;
  // SQL: Store as `TEXT`. Index this column. A UNIQUE constraint on
  //      (webAuthnUserID + user) also achieves maximum user privacy
  webauthnUserID: Base64URLString;
  // SQL: Consider `BIGINT` since some authenticators return atomic timestamps as counters
  counter: number;
  // SQL: `VARCHAR(32)` or similar, longest possible value is currently 12 characters
  // Ex: 'singleDevice' | 'multiDevice'
  deviceType: CredentialDeviceType;
  // SQL: `BOOL` or whatever similar type is supported
  backedUp: boolean;
  // SQL: `VARCHAR(255)` and store string array as a CSV string
  // Ex: ['ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb']
  transports?: AuthenticatorTransportFuture[];
};

export const passkeys = pgTable(
  "passkeys",
  {
    id: text("id").primaryKey().notNull(),
    publicKey: bytea("public_key").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    webauthnUserID: text("webauth_user_id").notNull(),
    counter: bigint("counter", { mode: "number" }).notNull(),
    deviceType: varchar("device_type", {
      length: 32,
    }).notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: varchar("transports", {
      length: 255,
    }).notNull(),
  },
  (passkey) => ({
    webauthnUserIdUnique: unique().on(passkey.userId, passkey.webauthnUserID),
  }),
);

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
  "permissions_enum",
  permissionsTypes.options,
);

export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: pgPermissionsEnum("name").unique().notNull(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at")
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
  "roles",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    description: varchar("description", { length: 255 }),
    /**
     * workspace this role belongs to
     */
    workspaceId: integer("workspace_id")
      .references(() => workspaces.id)
      .notNull(),
    ...timeStamps,
    ...whoToBlame,
  },
  (t) => ({
    // role name must be unique by workspace
    roleNameUnique: unique().on(t.workspaceId, t.name),
  }),
);

export const permissionsToRoles = pgTable(
  "permissions_to_roles",
  {
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
  }),
);

export const usersToRoles = pgTable(
  "users_to_roles",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id),
    ...timeStamps,
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

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  /**
   * implicitly means the admin
   */
  createdById: integer("created_by_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  imageUrl: text("imageUrl"),
  ...timeStamps,
  updatedById: integer("updated_by_id").references(() => users.id),
});

export const userToWorkspaceStatusEnum = pgEnum("user_to_workspace_status", [
  /**
   * user could interact with the workspace, or accepted the invite
   */
  "active",
  "invited",
  /**
   * user declined invitation
   */
  "declined",
  /**
   * admin disabled this user from accessing the workspace
   *  could re-enable this user again
   */
  "archived",
]);

export const usersToWorkspaces = pgTable(
  "users_to_workspaces",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    workspaceId: integer("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    status: userToWorkspaceStatusEnum("status").notNull(),
    invitationToken: text("invitation_token"),
    declinedAt: timestamp("declined_at"),
    ...timeStamps,
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.workspaceId] }),
  }),
);

export const apps = pgTable("apps", {
  id: serial("id").primaryKey(),
  createdById: integer("created_by_id")
    .references(() => users.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  env: varchar("app_env")
    .$type<"development" | "production">()
    .default("development"),
  description: varchar("description", { length: 255 }),
  /**
   * workspace this app belongs to
   */
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
  ...timeStamps,
  updatedById: integer("updated_by_id").references(() => users.id),
  deletedById: integer("deleted_by_id").references(() => users.id),
});

/**
 * many to many relation
 */
export const appsToRoles = pgTable(
  "appsToRoles",
  {
    appId: integer("app_id")
      .notNull()
      .references(() => apps.id),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id),
    permission: varchar("permission").notNull(),
    ...timeStamps,
  },
  (t) => ({
    pk: primaryKey({ columns: [t.appId, t.roleId] }),
  }),
);

export const webloomTables = pgTable("tables", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  ...timeStamps,
  createdById: integer("created_by_id")
    .references(() => users.id)
    .notNull(),
  /**
   * workspace id this table belongs to
   */
  workspaceId: integer("workspace_id")
    .references(() => workspaces.id)
    .notNull(),
});

export const pgColumnTypsEnum = pgEnum("pg_columns_enum", [
  "varchar",
  "int",
  "bigint",
  "serial",
  "boolean",
]);

export const webloomColumns = pgTable(
  "columns",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    type: pgColumnTypsEnum("type").notNull(),
    tableId: integer("table_id")
      .notNull()
      .references(() => webloomTables.id, { onDelete: "cascade" }),
  },
  (t) => ({
    name: unique().on(t.tableId, t.name),
  }),
);
