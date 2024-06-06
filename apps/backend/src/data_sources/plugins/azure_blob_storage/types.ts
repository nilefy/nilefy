import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export const configSchema = z.object({
  connectionString: z.string().min(1),
});

const queryIncludeDeletedSchema = z.boolean().optional();
const queryContainerSchema = z.string();
const queryPageSizeSchema = z.number();
const queryPrefixSchema = z.string().optional();
const queryContinuationTokenSchema = z.string().optional();
const queryBlobSchema = z.string();
const queryContentSchema = z.unknown();
const queryContentTypeSchema = z.string().optional();

const query = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('List containers'),
    includeDeleted: queryIncludeDeletedSchema,
  }),
  z.object({
    operation: z.literal('List blobs'),
    container: queryContainerSchema,
    pageSize: queryPageSizeSchema,
    prefix: queryPrefixSchema,
    continuationToken: queryContinuationTokenSchema,
  }),
  z.object({
    operation: z.literal('Create container'),
    container: queryContainerSchema,
  }),
  z.object({
    operation: z.literal('Upload blob'),
    container: queryContainerSchema,
    blob: queryBlobSchema,
    content: queryContentSchema,
    contentType: queryContentTypeSchema,
  }),
  z.object({
    operation: z.literal('Delete container'),
    container: queryContainerSchema,
  }),
  z.object({
    operation: z.literal('Delete blob'),
    container: queryContainerSchema,
    blob: queryBlobSchema,
  }),
  z.object({
    operation: z.literal('Read blob'),
    container: queryContainerSchema,
    blob: queryBlobSchema,
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

const operations = [
  'List containers',
  'List blobs',
  'Create container',
  'Upload blob',
  'Delete container',
  'Delete blob',
  'Read blob',
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
              { label: 'List containers', value: 'List containers' },
              { label: 'List blobs', value: 'List blobs' },
              { label: 'Create container', value: 'Create container' },
              { label: 'Upload blob', value: 'Upload blob' },
              { label: 'Delete container', value: 'Delete container' },
              { label: 'Delete blob', value: 'Delete blob' },
              { label: 'Read blob', value: 'Read blob' },
            ],
            validation: zodToJsonSchema(
              z
                .union([
                  z.literal('List containers'),
                  z.literal('List blobs'),
                  z.literal('Create container'),
                  z.literal('Upload blob'),
                  z.literal('Delete container'),
                  z.literal('Delete blob'),
                  z.literal('Read blob'),
                ])
                .default('List containers'),
            ),
          },
        },
        {
          path: 'config.container',
          label: 'Container',
          type: 'input',
          options: {
            placeholder: 'Enter container name',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'EQUALS',
                value: operations[0],
              },
            ],
          },
          validation: zodToJsonSchema(queryContainerSchema),
        },
        {
          path: 'config.blob',
          label: 'Blob',
          type: 'input',
          options: {
            placeholder: 'Enter blob name',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_IN',
                value: [operations[3], operations[5], operations[6]],
              },
            ],
          },
          validation: zodToJsonSchema(queryBlobSchema),
        },
        {
          path: 'config.includDeleted',
          label: 'Include Deleted Containers',
          type: 'checkbox',
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
          validation: zodToJsonSchema(queryIncludeDeletedSchema),
        },
        // {
        //   path: 'config.content',
        //   label: 'Content',
        //   type: '', // unknown
        //   hidden: {
        //     conditionType: 'OR',
        //     conditions: [
        //       {
        //         path: 'config.operation',
        //         comparison: 'NOT_EQUALS',
        //         value: operations[3],
        //       },
        //     ],
        //   },
        //   validation: zodToJsonSchema(
        //     z.object({
        //       content: z.unknown(),
        //     }),
        //   ),
        // },
        // {
        //   path: 'config.contentType',
        //   label: 'Content Type',
        //   type: 'input',
        //   hidden: {
        //     conditionType: 'OR',
        //     conditions: [
        //       {
        //         path: 'config.operation',
        //         comparison: 'NOT_EQUALS',
        //         value: operations[3],
        //       },
        //     ],
        //   },
        //   validation: zodToJsonSchema(
        //     z.object({
        //       contentType: z.string().optional(),
        //     }),
        //   ),
        // },
        {
          path: 'config.pageSize',
          label: 'Page Size',
          type: 'input',
          options: {
            placeholder: 'Enter page size',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_EQUALS',
                value: operations[1],
              },
            ],
          },
          validation: zodToJsonSchema(queryPageSizeSchema),
        },
        {
          path: 'config.prefix',
          label: 'Prefix',
          type: 'input',
          options: {
            placeholder: 'Enter prefix',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_EQUALS',
                value: operations[1],
              },
            ],
          },
          validation: zodToJsonSchema(queryPageSizeSchema),
        },
        {
          path: 'config.continuationToken',
          label: 'Continuation Token',
          type: 'input',
          options: {
            placeholder: 'Enter continuation token',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_EQUALS',
                value: operations[1],
              },
            ],
          },
          validation: zodToJsonSchema(queryContinuationTokenSchema),
        },
      ],
    },
  ],
};
