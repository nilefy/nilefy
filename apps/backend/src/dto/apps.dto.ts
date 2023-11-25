import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { apps as appsDrizzle } from '../drizzle/schema/schema';

export const appSchema = createSelectSchema(appsDrizzle);

export const createAppDb = createInsertSchema(appsDrizzle, {
  name: (schema) => schema.name.min(1).max(100),
});

export const createAppSchema = createAppDb.pick({
  name: true,
  description: true,
  state: true,
});

export const updateAppDb = createAppDb
  .partial()
  // we don't support move the app from workspace to another one right now if we want to support this feature this `omit` should be deleted
  .omit({ workspaceId: true })
  .extend({
    updatedById: z.number(),
  });

export const updateAppSchema = createAppSchema.partial();

export type AppDto = z.infer<typeof appSchema>;
/**
 * insert in the db interface
 */
export type CreateAppDb = z.infer<typeof createAppDb>;
/**
 * API insert interface
 */
export type CreateAppDto = z.infer<typeof createAppSchema>;
export type UpdateAppDb = z.infer<typeof updateAppDb>;
export type UpdateAppDto = z.infer<typeof updateAppSchema>;

// TODO: remove this type and import it from shared package
export type WebloomGridDimensions = {
  /**
   * columnNumber from left to right starting from 0 to NUMBER_OF_COLUMNS
   */
  col: number;
  /**
   * rowNumber from top to bottom starting from 0 to infinity
   */
  row: number;
  // this propert is exclusive for canvas nodes
  columnWidth?: number;
  // number of columns this node takes
  columnsCount: number;
  /**
   * number of rows this node takes
   */
  rowsCount: number;
};

export type WebloomNode = {
  id: string;
  name: string;
  nodes: string[];
  parent: string;
  isCanvas?: boolean;
  props: Record<string, unknown>;
  type: string;
} & WebloomGridDimensions;
