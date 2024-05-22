import {
  dbConnect,
  permissions,
  permissionsToRoles,
  roles,
  users,
  usersToRoles,
  workspaces,
  usersToWorkspaces,
} from '@webloom/database';
import { genSalt, hash } from 'bcrypt';
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
