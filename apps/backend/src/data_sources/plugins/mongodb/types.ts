import { ObjectId } from 'mongodb';
import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export const configSchema = z.object({
  uri: z.string().min(1),
});

const queryDatabaseSchema = z.string().min(1).optional();
const queryCollectionSchema = z.string().min(1);
const queryDocumentsSchema = z.array(z.record(z.string(), z.unknown()));
const queryFilterSchema = z.record(z.string(), z.unknown());
const queryMultipleSchema = z.boolean().optional();
const queryUpdateSchema = z.record(z.string(), z.unknown());
const queryReplacementSchema = z.record(z.string(), z.unknown());

const query = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('Create Document'),
    database: queryDatabaseSchema,
    collection: queryCollectionSchema,
    documents: queryDocumentsSchema,
  }),
  z.object({
    operation: z.literal('Find Document'),
    database: queryDatabaseSchema,
    collection: queryCollectionSchema,
    filter: queryFilterSchema,
    multiple: queryMultipleSchema,
  }),
  z.object({
    operation: z.literal('View Database Collections'),
    database: queryDatabaseSchema,
  }),
  z.object({
    operation: z.literal('Count Documents'),
    database: queryDatabaseSchema,
    collection: queryCollectionSchema,
    filter: queryFilterSchema,
  }),
  z.object({
    operation: z.literal('Update Document'),
    database: queryDatabaseSchema,
    collection: queryCollectionSchema,
    filter: queryFilterSchema,
    update: queryUpdateSchema,
    multiple: queryMultipleSchema,
  }),
  z.object({
    operation: z.literal('Replace Document'),
    database: queryDatabaseSchema,
    collection: queryCollectionSchema,
    filter: queryFilterSchema,
    replacement: queryReplacementSchema,
  }),
  z.object({
    operation: z.literal('Delete Document'),
    database: queryDatabaseSchema,
    collection: queryCollectionSchema,
    filter: queryFilterSchema,
    multiple: queryMultipleSchema,
  }),
]);

export const querySchema = query;

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
          validation: zodToJsonSchema(queryDatabaseSchema),
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
          validation: zodToJsonSchema(queryCollectionSchema),
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
          validation: zodToJsonSchema(queryDocumentsSchema),
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
          validation: zodToJsonSchema(queryFilterSchema),
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
          validation: zodToJsonSchema(queryUpdateSchema),
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
          validation: zodToJsonSchema(queryReplacementSchema),
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
          validation: zodToJsonSchema(queryMultipleSchema),
        },
      ],
    },
  ],
};
