import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export const configSchema = z.object({
  connectionString: z.string(),
});

const query = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('List containers'),
    includeDeleted: z.boolean().optional(),
  }),
  z.object({
    operation: z.literal('List blobs'),
    container: z.string(),
    pageSize: z.number(),
    prefix: z.string().optional(),
    continuationToken: z.string().optional(),
  }),
  z.object({
    operation: z.literal('Create container'),
    container: z.string(),
  }),
  z.object({
    operation: z.literal('Upload blob'),
    container: z.string(),
    blob: z.string(),
    content: z.unknown(),
    contentType: z.string().optional(),
  }),
  z.object({
    operation: z.literal('Delete container'),
    container: z.string(),
  }),
  z.object({
    operation: z.literal('Delete blob'),
    container: z.string(),
    blob: z.string(),
  }),
  z.object({
    operation: z.literal('Read blob'),
    container: z.string(),
    blob: z.string(),
  }),
]);
export const querySchema = z.object({
  query: query,
});

export type ConfigT = z.infer<typeof configSchema>;
export type QueryT = z.infer<typeof querySchema>;

export const pluginConfigForm = {
  schema: zodToJsonSchema(configSchema, 'configSchema'),
  uiSchema: {
    connectionString: {
      'ui:placeholder': 'Enter connection string',
      'ui:title': 'Connection string',
    },
  },
};

export const queryConfigForm = {
  schema: zodToJsonSchema(querySchema, 'querySchema'),
  uiSchema: {
    operation: {
      'ui:title': 'Operation',
      'ui:widget': 'select',
    },
    container: {
      'ui:title': 'Container Name',
    },
    blob: {
      'ui:title': 'Blob Name',
    },
    contentType: {
      'ui:title': 'Content Type',
    },
    pageSize: {
      'ui:title': 'Page Size',
    },
    prefix: {
      'ui:title': 'Prefix',
    },
    continuationToken: {
      'ui:title': 'Continuation Token',
    },
  },
};
