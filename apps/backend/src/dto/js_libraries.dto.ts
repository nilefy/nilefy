import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { jsLibraries } from '@nilefy/database';

export const jsLibrariesSchema = createSelectSchema(jsLibraries);

export const jsLibrariesDb = createInsertSchema(jsLibraries);

export const addJsLibrarySchema = jsLibrariesDb.pick({
  id: true,
  url: true,
});

export const updateJsLibrarySchema = addJsLibrarySchema.partial();

export type JsLibraryDb = z.infer<typeof jsLibrariesDb>;

export class AddJsLibraryDto extends createZodDto(addJsLibrarySchema) {}
export class UpdateJsLibraryDto extends createZodDto(updateJsLibrarySchema) {}
export class JsLibraryDto extends createZodDto(jsLibrariesSchema) {}
