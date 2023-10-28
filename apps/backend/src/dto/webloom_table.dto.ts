import { z } from 'zod';

const ColumnType = z.enum(['varchar', 'int', 'bigint', 'serial', 'boolean']);
const Column = z.object({
  tableId: z.number().optional(),
  name: z.string(),
  type: ColumnType,
});

export const webloomTableSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3).max(255),
  columns: z.array(Column).optional(),
  // createdAt: z.date().optional(),
  // deletedAt: z.date().optional(),
  // updatedAt: z.date().optional(),
});

// export const webloomCreateTableSchema = z.object({
//   name: z.string().min(3).max(255),
// });

export type WebloomTableDto = z.infer<typeof webloomTableSchema>;
export type WebloomColumnTypeDto = z.infer<typeof ColumnType>;
export type WebloomColumnDto = z.infer<typeof Column>;
// export type WebloomCreateTableDto = z.infer<typeof webloomCreateTableSchema>;
