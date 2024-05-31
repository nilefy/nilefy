import { EDITOR_CONSTANTS } from '@nilefy/constants';
import {
  dbConnect,
  permissions,
  permissionsToRoles,
  roles,
  users,
  usersToRoles,
  workspaces,
  usersToWorkspaces,
  apps,
  pages,
  components,
} from '@nilefy/database';
import { genSalt, hash } from 'bcrypt';
import { and, eq } from 'drizzle-orm';
export const createWorkspaceAndApp = async (username: string) => {
  const [db] = await dbConnect(process.env.DB_URL!);
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  const workspace = (
    await db
      .insert(workspaces)
      .values({ name: 'workspace1', createdById: user!.id })
      .returning()
  )[0]!;
  const app = (
    await db
      .insert(apps)
      .values({
        name: 'My App',
        createdById: user!.id,
        workspaceId: workspace.id,
      })
      .returning()
  )[0]!;
  const page = (
    await db
      .insert(pages)
      .values({
        appId: app.id,
        createdById: user!.id,
        handle: 'new_page',
        index: 0,
        name: 'new page',
      })
      .returning()
  )[0]!;
  await db.insert(components).values({
    id: EDITOR_CONSTANTS.ROOT_NODE_ID,
    type: EDITOR_CONSTANTS.WIDGET_CONTAINER_TYPE_NAME,
    pageId: page.id,
    createdById: user!.id,
    parentId: null,
    props: {
      className: 'h-full w-full',
    },
    col: 0,
    row: 0,
    columnsCount: EDITOR_CONSTANTS.NUMBER_OF_COLUMNS,
    rowsCount: 0,
  });
  return { workspace: workspace.id, app: app.id, page: page.id };
};
export const clearApps = async (username: string) => {
  const [db] = await dbConnect(process.env.DB_URL!);
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  const userId = user!.id;

  const userApps = await db.query.apps.findMany({
    where: eq(apps.createdById, userId),
  });
  try {
    const res = await Promise.all(
      userApps.map(async (app) => {
        return await db
          .delete(apps)
          .where(
            and(eq(apps.id, app.id), eq(apps.workspaceId, app.workspaceId)),
          )
          .returning();
      }),
    );
    console.dir(res, { depth: null });
  } catch (e) {
    console.log(e);
  }
};

export const createApp = async (username: string, workspaceId: number) => {
  const [db] = await dbConnect(process.env.DB_URL!);
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  return (
    await db
      .insert(apps)
      .values({
        name: 'My App',
        createdById: user!.id,
        workspaceId: workspaceId,
      })
      .returning()
  )[0]!;
};

export const acquireAccount = async (id: number) => {
  const [db] = await dbConnect(process.env.DB_URL!);
  const salt = await genSalt(10);
  const password = 'password';
  const passwordHashed = await hash('password', salt);
  const username = `user${id}`;
  const email = `${username}@gmail.com`;
  const user = (
    await db!
      .insert(users)
      .values({
        email: email,
        username: username,
        password: passwordHashed,
        // todo: remove this when we add tests for onboarding
        onboardingCompleted: true,
        emailVerified: new Date(),
      })
      .returning()
      .onConflictDoNothing()
  )[0]!;
  const workspace = (
    await db
      .insert(workspaces)
      .values({ name: 'workspace1', createdById: user.id })
      .returning()
      .onConflictDoNothing()
  )[0]!;
  await db
    .insert(usersToWorkspaces)
    .values({ userId: user.id, workspaceId: workspace.id })
    .returning();
  const allPermissions = await db.select().from(permissions);
  const res = (
    await db
      .insert(roles)
      .values({
        createdById: user.id,
        name: 'test' + username,
        workspaceId: workspace.id,
      })
      .returning()
  )[0]!;
  await db
    .insert(permissionsToRoles)
    .values(allPermissions.map((p) => ({ permissionId: p.id, roleId: res.id })))
    .returning();
  await db
    .insert(usersToRoles)
    .values({ roleId: res.id, userId: user.id })
    .returning();
  return { username, password, email, workspaceId: workspace.id };
};

export const wait = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};
