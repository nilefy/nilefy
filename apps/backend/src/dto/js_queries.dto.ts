import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { jsQueries } from '@nilefy/database';

export const jsQuerySchema = createSelectSchema(jsQueries, {
  settings: z.unknown(),
});

/**
 * type of js Query insert
 */
export const jsQueryDb = createInsertSchema(jsQueries);

export const addJsQuerySchema = jsQueryDb.pick({
  id: true,
  query: true,
  settings: true,
});

export const updateJsQuerySchema = addJsQuerySchema.partial();

/**
 * type of js Query insert
 */
export type JsQueryDb = z.infer<typeof jsQueryDb>;

export class AddJsQueryDto extends createZodDto(addJsQuerySchema) {}
export class UpdateJsQueryDto extends createZodDto(updateJsQuerySchema) {}
export class JsQueryDto extends createZodDto(jsQuerySchema) {}
