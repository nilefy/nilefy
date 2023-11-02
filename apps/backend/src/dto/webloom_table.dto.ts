import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import {
  webloomTables as webloomTablesDrizzle,
  webloomColumns as webloomColumnsDrizzle,
} from '../drizzle/schema/schema';

export const webloomTableColumn = createSelectSchema(webloomColumnsDrizzle, {
  name: (schema) => schema.name.min(3).max(255),
});

export const webloomTableSchema = createSelectSchema(webloomTablesDrizzle, {
  name: (schema) => schema.name.min(3).max(255),
});

/**
 * insert column db interface
 */
export const webloomColumnInsertDb = createInsertSchema(webloomColumnsDrizzle, {
  name: (schema) => schema.name.min(3).max(255),
});

/**
 * insert column API interface
 *
 * note we don't expose `tableId` because this operation should be only done in the context of creating new table
 */
export const webloomColumnInsertDto = webloomColumnInsertDb.pick({
  name: true,
  type: true,
});

/**
 * insert table db interface
 */
export const webloomTableInsertDb = createInsertSchema(webloomTablesDrizzle, {
  name: (schema) => schema.name.min(3).max(255),
});

/**
 * insert table API interface
 */
export const webloomTableInsertDto = webloomTableInsertDb
  .pick({
    name: true,
  })
  .extend({
    columns: z.array(webloomColumnInsertDto),
  });

export type WebloomColumnDto = z.infer<typeof webloomTableColumn>;
export type WebloomTableDto = z.infer<typeof webloomTableSchema>;
/**
 * insert column db interface
 */
export type InsertWebloomColumnDb = z.infer<typeof webloomColumnInsertDb>;
/**
 * insert column API interface
 */
export type InsertWebloomColumnDto = z.infer<typeof webloomColumnInsertDto>;

/**
 * insert table db interface
 */
export type InsertWebloomTableDb = z.infer<typeof webloomTableInsertDb>;
/**
 * insert table API interface
 */
export type InsertWebloomTableDto = z.infer<typeof webloomTableInsertDto>;
