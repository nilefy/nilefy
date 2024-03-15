import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { components as componentsDrizzle } from '../drizzle/schema/appsState.schema';

export const componentSchema = createSelectSchema(componentsDrizzle).extend({
  props: z.record(z.string(), z.unknown()),
});

export const createComponentDb = createInsertSchema(componentsDrizzle).extend({
  props: z.record(z.string(), z.unknown()),
});

export const updateComponentDb = createComponentDb
  .partial()
  // we don't support move the app from workspace to another one right now if we want to support this feature this `omit` should be deleted
  .omit({ pageId: true })
  .extend({
    updatedById: z.number(),
  });

export type ComponentDto = z.infer<typeof componentSchema>;
/**
 * insert in the db interface
 */
export type CreateComponentDb = z.infer<typeof createComponentDb>;
export type UpdateComponentDb = z.infer<typeof updateComponentDb>;

// FRONTEND NODE TYPE
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
  nodes: string[];
  parentId: string;
  isCanvas?: boolean;
  props: Record<string, unknown>;
  type: string;
} & WebloomGridDimensions;

export const frontKnownKeysSchema = componentSchema.pick({
  id: true,
  parentId: true,
  isCanvas: true,
  props: true,
  type: true,
  col: true,
  row: true,
  columnsCount: true,
  rowsCount: true,
});

export const frontKnownKeys = frontKnownKeysSchema.keyof().options;

export type WebloomTree = Record<string, WebloomNode>;
