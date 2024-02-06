import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

const configSchemaBone = z.object({
  user: z.string().min(1),
  host: z.string().min(1),
  port: z.number().default(5432),
  database: z.string().min(1),
  password: z.string(),
  ssl: z.boolean().default(false),
  sslCertificate: z.enum(['ca', 'self-signed', 'none']).optional(),
  connectionOptions: z.string().optional(),
});

// second approach:
export const configSchemaM = z.object({
  development: configSchemaBone,
  production: configSchemaBone,
});

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
  query: z.string().min(1),
});
export const querySchemaBone = z.object({
  query: z.string().min(1),
});

export const querySchemaM = z.object({
  development: querySchemaBone,
  production: querySchemaBone,
});

export type ConfigT = z.infer<typeof configSchemaM>;
export type QueryT = z.infer<typeof querySchemaM>;

//? UI has to adjust to include this form 2 times
//? one for each environment (development, production)
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

//? UI has to adjust to include this form 2 times
//? one for each environment (development, production)
export const queryConfigForm = {
  schema: zodToJsonSchema(querySchemaBone, 'querySchema'),
  uiSchema: {
    query: {
      'ui:widget': 'sql',
      'ui:placeholder': 'select * from table;',
      'ui:title': 'SQL',
    },
  },
};
