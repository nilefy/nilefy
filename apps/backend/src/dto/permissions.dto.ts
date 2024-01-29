// import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import { permissions as permissionsDrizzle } from '../drizzle/schema/schema';
import { createZodDto } from 'nestjs-zod';

export const permissionsSchema = createSelectSchema(permissionsDrizzle);

// export type PermissionDto = z.infer<typeof permissionsSchema>;
export class PermissionDto extends createZodDto(permissionsSchema) {}
export type PermissionTypes = PermissionDto['name'];
