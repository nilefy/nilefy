import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { jsLibraries } from '@webloom/database';

export const jsLibrariesSchema = createSelectSchema(jsLibraries);

export const jsLibrariesDb = createInsertSchema(jsLibraries);

export const addJsLibrarySchema = jsLibrariesDb.pick({
  id: true,
  name: true,
  url: true,
  availableAs: true,
});

export const updateJsLibrarySchema = addJsLibrarySchema.partial();

/**
 * type of js Query insert
 */
export type JsLibraryDb = z.infer<typeof jsLibrariesDb>;

export class AddJsQueryDto extends createZodDto(addJsLibrarySchema) {}
export class UpdateJsQueryDto extends createZodDto(updateJsLibrarySchema) {}
export class JsQueryDto extends createZodDto(jsLibrariesSchema) {}
