import { z } from 'zod';

export const configSchema = z.object({
  uri: z.string().min(1),
});

const query = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('Create Document'),
    database: z.string().min(1),
    collection: z.string().min(1),
    documents: z.array(z.record(z.string(), z.unknown())),
  }),
  z.object({
    operation: z.literal('Find Document'),
    database: z.string().min(1),
    collection: z.string().min(1),
    filter: z.record(z.string(), z.unknown()),
    multiple: z.boolean().default(false),
  }),
  z.object({
    operation: z.literal('View Database Collections'),
    database: z.string().min(1),
  }),
  z.object({
    operation: z.literal('View Collection Documents'),
    database: z.string().min(1),
    collection: z.string().min(1),
  }),
  z.object({
    operation: z.literal('Update Document'),
    database: z.string().min(1),
    collection: z.string().min(1),
    filter: z.record(z.string(), z.unknown()),
    data: z.record(z.string(), z.unknown()),
  }),
  z.object({
    operation: z.literal('Replace Document'),
    database: z.string().min(1),
    collection: z.string().min(1),
    filter: z.record(z.string(), z.unknown()),
    document: z.record(z.string(), z.unknown()),
  }),
  z.object({
    operation: z.literal('Delete Document'),
    database: z.string().min(1),
    collection: z.string().min(1),
    filter: z.record(z.string(), z.unknown()),
    multiple: z.boolean().default(false),
  }),
]);

export const querySchema = z.object({
  query: query,
});

export type ConfigT = z.infer<typeof configSchema>;
export type QueryT = z.infer<typeof querySchema>;

// TODO
export const pluginConfigForm = {};
export const queryConfigForm = {};
