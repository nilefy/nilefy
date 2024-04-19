import { Document, ObjectId } from 'mongodb';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

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

export const pluginConfigForm = {
  schema: zodToJsonSchema(configSchema, 'configSchema'),
  uiSchema: {
    uri: {
      'ui:widget': 'textarea',
      'ui:title': 'Connection String',
      'ui:placeholder': 'Enter Connection String URI',
    },
  },
};

const operations = [
  'Create Document',
  'Find Document',
  'View Database Collections',
  'Count Documents',
  'Update Document',
  'Replace Document',
  'Delete Document',
];
export const queryConfigForm = {
  schema: {
    type: 'object',
    properties: {
      query: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            enum: operations,
            default: operations[0],
          },
        },
        required: ['operation'],
        dependencies: {
          operation: {
            oneOf: [
              {
                properties: {
                  operation: {
                    enum: [operations[0]],
                  },
                  database: {
                    type: 'string',
                  },
                  collection: {
                    type: 'string',
                  },
                  documents: {
                    type: 'array',
                  },
                },
                required: ['collection', 'documents'],
              },
              {
                properties: {
                  operation: {
                    enum: [operations[1]],
                  },
                  database: {
                    type: 'string',
                  },
                  collection: {
                    type: 'string',
                  },
                  filter: {
                    type: 'object',
                  },
                  multiple: {
                    type: 'boolean',
                  },
                },
                required: ['collection', 'filter'],
              },
              {
                properties: {
                  operation: {
                    enum: [operations[2]],
                  },
                  database: {
                    type: 'string',
                  },
                },
              },
              {
                properties: {
                  operation: {
                    enum: [operations[3]],
                  },
                  database: {
                    type: 'string',
                  },
                  collection: {
                    type: 'string',
                  },
                  filter: {
                    type: 'object',
                  },
                },
                required: ['collection'],
              },
              {
                properties: {
                  operation: {
                    enum: [operations[4]],
                  },
                  database: {
                    type: 'string',
                  },
                  collection: {
                    type: 'string',
                  },
                  filter: {
                    type: 'object',
                  },
                  update: {
                    type: 'object',
                  },
                  multiple: {
                    type: 'boolean',
                  },
                  'return document': {
                    type: 'boolean',
                  },
                },
                required: ['collection', 'filter', 'update'],
              },
              {
                properties: {
                  operation: {
                    enum: [operations[5]],
                  },
                  database: {
                    type: 'string',
                  },
                  collection: {
                    type: 'string',
                  },
                  filter: {
                    type: 'object',
                  },
                  replacement: {
                    type: 'object',
                  },
                  'return document': {
                    type: 'boolean',
                  },
                },
                required: ['collection', 'filter', 'replacement'],
              },
              {
                properties: {
                  operation: {
                    enum: [operations[6]],
                  },
                  database: {
                    type: 'string',
                  },
                  collection: {
                    type: 'string',
                  },
                  filter: {
                    type: 'object',
                  },
                  multiple: {
                    type: 'boolean',
                  },
                  'return document': {
                    type: 'boolean',
                  },
                },
                required: ['collection', 'filter'],
              },
            ],
          },
        },
      },
    },
    required: ['query'],
    additionalProperties: false,
  },
};
