import { Document, ObjectId } from 'mongodb';
import { z } from 'zod';

export const configSchema = z.object({
  uri: z.string().min(1),
});

const query = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('Create Document'),
    database: z.string().min(1).optional(),
    collection: z.string().min(1),
    documents: z.array(z.record(z.string(), z.unknown())),
  }),
  z.object({
    operation: z.literal('Find Document'),
    database: z.string().min(1).optional(),
    collection: z.string().min(1),
    filter: z.record(z.string(), z.unknown()),
    multiple: z.boolean().optional(),
  }),
  z.object({
    operation: z.literal('View Database Collections'),
    database: z.string().min(1).optional(),
  }),
  z.object({
    operation: z.literal('Count Documents'),
    database: z.string().min(1).optional(),
    collection: z.string().min(1),
    filter: z.record(z.string(), z.unknown()).optional(),
  }),
  z.object({
    operation: z.literal('Update Document'),
    database: z.string().min(1).optional(),
    collection: z.string().min(1),
    filter: z.record(z.string(), z.unknown()),
    update: z.record(z.string(), z.unknown()),
    multiple: z.boolean().optional(),
    returnDoc: z.boolean().optional(),
  }),
  z.object({
    operation: z.literal('Replace Document'),
    database: z.string().min(1).optional(),
    collection: z.string().min(1),
    filter: z.record(z.string(), z.unknown()),
    replacement: z.record(z.string(), z.unknown()),
    returnDoc: z.boolean().optional(),
  }),
  z.object({
    operation: z.literal('Delete Document'),
    database: z.string().min(1).optional(),
    collection: z.string().min(1),
    filter: z.record(z.string(), z.unknown()),
    multiple: z.boolean().optional(),
    returnDoc: z.boolean().optional(),
  }),
]);

export const querySchema = z.object({
  query: query,
});

export type UpdateDocRetT = {
  id: ObjectId | null;
  documents: (Document | null)[];
};
export type DeleteDocRetT = {
  deletedCount: number;
  documents: (Document | null)[];
};

export type ConfigT = z.infer<typeof configSchema>;
export type QueryT = z.infer<typeof querySchema>;

// TODO
export const pluginConfigForm = {};
export const queryConfigForm = {};
