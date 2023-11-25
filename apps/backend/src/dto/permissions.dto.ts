import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import { permissions as permissionsDrizzle } from '../drizzle/schema/schema';

export const permissionsSchema = createSelectSchema(permissionsDrizzle);

export type PermissionDto = z.infer<typeof permissionsSchema>;
export type PermissionTypes = PermissionDto['name'];
