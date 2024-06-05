import { ObjectId } from 'mongodb';
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
  }),
  z.object({
    operation: z.literal('Replace Document'),
    database: z.string().min(1).optional(),
    collection: z.string().min(1),
    filter: z.record(z.string(), z.unknown()),
    replacement: z.record(z.string(), z.unknown()),
  }),
  z.object({
    operation: z.literal('Delete Document'),
    database: z.string().min(1).optional(),
    collection: z.string().min(1),
    filter: z.record(z.string(), z.unknown()),
    multiple: z.boolean().optional(),
  }),
]);

export const querySchema = z.object({
  query: query,
});

export type UpdateDocRetT = {
  updatedIds: (ObjectId | null)[];
};
export type DeleteDocRetT = {
  deletedCount: number;
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
  formConfig: [
    {
      sectionName: 'Basic',
      children: [
        {
          path: 'config.operation',
          label: 'Operation',
          type: 'select',
          options: {
            items: [
              { label: 'Create Document', value: 'Create Document' },
              { label: 'Find Document', value: 'Find Document' },
              {
                label: 'View Database Collections',
                value: 'View Database Collections',
              },
              { label: 'Count Documents', value: 'Count Documents' },
              { label: 'Update Document', value: 'Update Document' },
              { label: 'Replace Document', value: 'Replace Document' },
              { label: 'Delete Document', value: 'Delete Document' },
            ],
            validation: zodToJsonSchema(
              z
                .union([
                  z.literal('Create Document'),
                  z.literal('Find Document'),
                  z.literal('View Database Collections'),
                  z.literal('Count Documents'),
                  z.literal('Update Document'),
                  z.literal('Replace Document'),
                  z.literal('Delete Document'),
                ])
                .default('Create Document'),
            ),
          },
        },
        {
          path: 'config.database',
          label: 'Database',
          type: 'input',
          options: {
            placeholder: 'Enter database name',
          },
          validation: zodToJsonSchema(
            z.object({
              database: z.string().optional(),
            }),
          ),
        },
        {
          path: 'config.collection',
          label: 'Collection',
          type: 'input',
          options: {
            placeholder: 'Enter collection name',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'EQUALS',
                value: operations[2],
              },
            ],
          },
          validation: zodToJsonSchema(
            z.object({
              collection: z.string().min(1),
            }),
          ),
        },
        {
          path: 'config.documents',
          label: 'Document/s',
          type: 'inlineCodeInput',
          options: {
            placeholder: '[ { _id: 0, role: "user" } ]',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_EQUALS',
                value: operations[0],
              },
            ],
          },
          validation: zodToJsonSchema(
            z.object({
              documents: z.array(z.record(z.string(), z.unknown())),
            }),
          ),
        },
        {
          path: 'config.filter',
          label: 'Filter',
          type: 'inlineCodeInput',
          options: {
            placeholder: '{ rating: { $gt : 5 } }',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'IN',
                value: [operations[0], operations[2]],
              },
            ],
          },
          validation: zodToJsonSchema(
            z.object({
              /**
               * should be optional in 'Count Documents' operation
               */
              filter: z.record(z.string(), z.unknown()),
            }),
          ),
        },
        {
          path: 'config.update',
          label: 'Update',
          type: 'inlineCodeInput',
          options: {
            placeholder:
              '{ $rename: { <field1>: <newName1>, <field2>: <newName2>, ... } }',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_EQUALS',
                value: operations[4],
              },
            ],
          },
          validation: zodToJsonSchema(
            z.object({
              update: z.record(z.string(), z.unknown()),
            }),
          ),
        },
        {
          path: 'config.replacement',
          label: 'Replacement',
          type: 'inlineCodeInput',
          options: {
            placeholder: '{ role: "admin" }',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_EQUALS',
                value: operations[5],
              },
            ],
          },
          validation: zodToJsonSchema(
            z.object({
              replacement: z.record(z.string(), z.unknown()),
            }),
          ),
        },
        {
          path: 'config.multiple',
          label: 'Multiple',
          type: 'checkbox',
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_IN',
                value: [operations[1], operations[4], operations[6]],
              },
            ],
          },
          validation: zodToJsonSchema(
            z.object({
              multiple: z.boolean().optional(),
            }),
          ),
        },
      ],
    },
  ],
};
export const queryConfig = {
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
