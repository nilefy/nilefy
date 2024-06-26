import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export const configSchema = z.object({
  privateKey: z.string(),
});

/**
 * used to validate the parsed json
 */
export const parsedConfigSchema = z.object({
  type: z.literal('service_account'),
  project_id: z.string(),
  private_key_id: z.string(),
  private_key: z.string(),
  client_email: z.string().email(),
  client_id: z.string(),
  auth_uri: z.literal('https://accounts.google.com/o/oauth2/auth'),
  token_uri: z.literal('https://accounts.google.com/o/oauth2/token'),
  auth_provider_x509_cert_url: z.literal(
    'https://www.googleapis.com/oauth2/v1/certs',
  ),
  client_x509_cert_url: z.string().url(),
});

const query = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('Delete file'),
    bucket: z.string(),
    file: z.string(),
  }),
  z.object({
    operation: z.literal('Upload file'),
    bucket: z.string(),
    filePath: z.string(),
  }),
  z.object({ operation: z.literal('List buckets') }),
  z.object({
    operation: z.literal('List files in a bucket'),
    bucket: z.string(),
    prefix: z.string().optional(),
  }),
  z.object({
    operation: z.literal('Download file'),
    bucket: z.string(),
    file: z.string(),
    destination: z.string().optional(),
  }),
]);

export const querySchema = z.object({
  query: query,
});

export type ConfigT = z.infer<typeof configSchema>;
export type ParsedConfigT = z.infer<typeof parsedConfigSchema>;
export type QueryT = z.infer<typeof querySchema>;

export const pluginConfigForm = {
  schema: zodToJsonSchema(configSchema, 'configSchema'),
  uiSchema: {
    privateKey: {
      'ui:description':
        'See [here](https://cloud.google.com/iam/docs/service-account-overview) for documentation on how to obtain this key.',
      'ui:enableMarkdownInDescription': true,
      'ui:title': 'Private key',
      'ui:widget': 'textarea',
      'ui:placeholder':
        '{\n  "type": "service_account",\n  "project_id": "yourProjectId",\n  "private_key_id": "yourPrivateKeyId",\n  "private_key": "-----BEGIN PRIVATE KEY-----\n11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111=\n-----END PRIVATE KEY-----\n",\n  "client_email": "google-adminsdk-pxixy@somethinggooglerelated.iam.gserviceaccount.com",\n  "client_id": "111111111111111111111",\n  "auth_uri": "https://accounts.google.com/o/oauth2/auth",\n  "token_uri": "https://oauth2.googleapis.com/token",\n  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",\n  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/google-adminsdk-pxixy%40somethinggooglerelated.iam.gserviceaccount.com"\n}',
    },
  },
};

const operations = [
  'Delete file', // 0
  'Upload file', //1
  'List buckets', //2
  'List files in a bucket', // 3
  'Download file', // 4
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
              { label: 'Delete file', value: 'Delete file' },
              { label: 'Upload file', value: 'Upload file' },
              { label: 'List buckets', value: 'List buckets' },
              {
                label: 'List files in a bucket',
                value: 'List files in a bucket',
              },
              { label: 'Download file', value: 'Download file' },
            ],
            validation: zodToJsonSchema(
              z
                .union([
                  z.literal('Delete file'),
                  z.literal('Upload file'),
                  z.literal('List buckets'),
                  z.literal('List files in a bucket'),
                  z.literal('Download file'),
                ])
                .default('Delete file'),
            ),
          },
        },
        {
          path: 'config.bucket',
          label: 'Bucket',
          type: 'input',
          options: {
            placeholder: 'Enter bucket name',
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
          validation: zodToJsonSchema(z.string()),
        },
        {
          path: 'config.file',
          label: 'File',
          type: 'input',
          options: {
            placeholder: 'Enter file name',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'IN',
                value: [operations[1], operations[2], operations[3]],
              },
            ],
          },
          validation: zodToJsonSchema(z.string()),
        },
        // {
        // path: 'config.filePath',
        // label: 'File Path',
        // type: '', // file picker
        // hidden: {
        //   conditionType: 'OR',
        //   conditions: [
        //     {
        //       path: 'config.operation',
        //       comparison: 'NOT_EQUALS',
        //       value: operations[1],
        //     },
        //   ],
        // },
        // },
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
                value: operations[3],
              },
            ],
          },
          validation: zodToJsonSchema(z.string().optional()),
        },
        // {
        //   path: 'config.destination',
        //   label: 'Destination',
        //   type: '', // file picker
        //   hidden: {
        //     conditionType: 'OR',
        //     conditions: [
        //       {
        //         path: 'config.operation',
        //         comparison: 'NOT_EQUALS',
        //         value: operations[4],
        //       },
        //     ],
        //   },
        //   validation: zodToJsonSchema(z.string().optional()),
        // },
      ],
    },
  ],
};
