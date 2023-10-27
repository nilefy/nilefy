import { z } from 'zod';

const ColumnType = z.enum(['varchar', 'int', 'bigint', 'serial', 'boolean']);

export const webloomTableSchema = z.object({
  name: z.string().min(3).max(255),
  columns: z.array(
    z.object({
      name: z.string().min(3).max(255),
      type: ColumnType,
    }),
  ),
});

export type WebloomTableDto = z.infer<typeof webloomTableSchema>;
export type WebloomColumnDto = z.infer<typeof ColumnType>;
