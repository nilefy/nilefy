import { z } from 'zod';

const ColumnType = z.enum(['boolean', 'text', 'number']);

export const tablecxSchema = z.object({
  name: z.string().min(3).max(255),
  columns: z.array(
    z.object({
      name: z.string().min(3).max(255),
      type: ColumnType,
    }),
  ),
});

export type TablecxDto = z.infer<typeof tablecxSchema>;
export type ColumnDto = z.infer<typeof ColumnType>;
