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

const ops = [
  z.literal('Create Document'), // 0
  z.literal('Find Document'), //1
  z.literal('View Database Collections'), //2
  z.literal('Count Documents'), //3
  z.literal('Update Document'), //4
  z.literal('Replace Document'), //5
  z.literal('Delete Document'), //6
] as const;
const operationOptions = z.union(ops).default('Create Document');
const query = z.discriminatedUnion('operation', [
  z.object({
    // create doc
    operation: ops[0],
    database: queryDatabaseSchema,
    collection: queryCollectionSchema,
    documents: queryDocumentsSchema,
  }),
  z.object({
    // find doc
    operation: ops[1],
    database: queryDatabaseSchema,
    collection: queryCollectionSchema,
    filter: queryFilterSchema,
    multiple: queryMultipleSchema,
  }),
  z.object({
    // view doc
    operation: ops[2],
    database: queryDatabaseSchema,
  }),
  z.object({
    // count docs
    operation: ops[3],
    database: queryDatabaseSchema,
    collection: queryCollectionSchema,
    filter: queryFilterSchema,
  }),
  z.object({
    // update docs
    operation: ops[4],
    database: queryDatabaseSchema,
    collection: queryCollectionSchema,
    filter: queryFilterSchema,
    update: queryUpdateSchema,
    multiple: queryMultipleSchema,
  }),
  z.object({
    // replace doc
    operation: ops[5],
    database: queryDatabaseSchema,
    collection: queryCollectionSchema,
    filter: queryFilterSchema,
    replacement: queryReplacementSchema,
  }),
  z.object({
    // delete doc
    operation: ops[6],
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
              { label: 'Create Document', value: ops[0].value },
              { label: 'Find Document', value: ops[1].value },
              {
                label: 'View Database Collections',
                value: ops[2].value,
              },
              { label: 'Count Documents', value: ops[3].value },
              { label: 'Update Document', value: ops[4].value },
              { label: 'Replace Document', value: ops[5].value },
              { label: 'Delete Document', value: ops[6].value },
            ],
            validation: zodToJsonSchema(operationOptions),
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
                value: ops[2].value,
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
                value: ops[0].value,
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
                value: [ops[0].value, ops[2].value],
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
                value: ops[4].value,
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
                value: ops[5].value,
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
                value: [ops[1].value, ops[4].value, ops[6].value],
              },
            ],
          },
          validation: zodToJsonSchema(queryMultipleSchema),
        },
      ],
    },
  ],
};
