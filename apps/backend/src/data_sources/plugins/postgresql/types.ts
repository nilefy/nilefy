import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export const configSchema = z.object({
  user: z.string().min(1),
  host: z.string().min(1),
  port: z.number().default(5432),
  database: z.string().min(1),
  password: z.string(),
  ssl: z.boolean().default(false),
  sslCertificate: z.enum(['ca', 'self-signed', 'none']).optional(),
  connectionOptions: z.string().optional(),
});

export const querySchema = z.object({
  query: z.string(),
});

export type ConfigT = z.infer<typeof configSchema>;
export type QueryT = z.infer<typeof querySchema>;

export const pluginConfigForm = {
  schema: zodToJsonSchema(configSchema, 'configSchema'),
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
      'ui:placeholder': 'Enter password',
    },
  },
};

export const queryConfigForm = {
  schema: zodToJsonSchema(querySchema, 'querySchema'),
  uiSchema: {
    query: {
      'ui:widget': 'sql',
      'ui:placeholder': 'select * from table;',
      'ui:title': 'SQL Query',
    },
    options: {
      'ui:widget': 'sql',
      'ui:placeholder': 'select * from table;',
      'ui:title': 'Options',
    },
  },
};
