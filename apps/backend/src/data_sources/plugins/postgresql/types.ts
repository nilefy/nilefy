import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export const configSchemaCore = z.object({
  user: z.string().min(1),
  host: z.string().min(1),
  port: z.number().default(5432),
  database: z.string().min(1),
  password: z.string(),
  ssl: z.boolean().default(false),
  sslCertificate: z.enum(['ca', 'self-signed', 'none']).optional(),
  connectionOptions: z.string().optional(),
});

export const encryptionConfigSchema = z.object({
  encryptFields: z.array(z.string()),
});

export const configSchema = z.object({
  configSchemaCore: configSchemaCore,
  encryptionConfig: encryptionConfigSchema,
});

const query = z.string().default('');
export const querySchema = z.object({
  query,
});

export type ConfigT = z.infer<typeof configSchema>;
export type QueryT = z.infer<typeof querySchema>;

export const pluginConfigForm = {
  schema: zodToJsonSchema(configSchemaCore, 'configSchema'),
  uiSchema: {
    host: {
      'ui:placeholder': 'localhost',
      'ui:title': 'Host',
    },
    port: {
      'ui:placeholder': '5432',
      'ui:title': 'Port',
    },
    database: {
      'ui:placeholder': 'Name of your database',
      'ui:title': 'Database Name',
    },
    user: {
      'ui:placeholder': 'Enter username',
    },
    password: {
      'ui:widget': 'password',
      'ui:placeholder': 'Enter password (will be AES-256-CBC encrypted)',
    },
  },
};

export const queryConfigForm = {
  formConfig: [
    {
      sectionName: 'Basic',
      children: [
        {
          path: 'config.query',
          label: 'Query',
          type: 'inlineCodeInput',
          options: {
            placeholder: 'select * from table;',
          },
          validation: zodToJsonSchema(query),
        },
      ],
    },
  ],
};
