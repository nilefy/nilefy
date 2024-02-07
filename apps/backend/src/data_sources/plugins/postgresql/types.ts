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
  query: z.object({
    query1: z.string().min(1),
    query2: z.object({
      query2query1: z.string().min(1),
      query2query2: z.string().min(1),
    }),
    query3: z.string().min(1),
    query4: z.string().min(1),
  }),
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

// TODO: revert this change
export const queryConfigForm = {
  schema: zodToJsonSchema(querySchema, 'querySchema'),
  uiSchema: {
    query: {
      query1: {
        'ui:widget': 'sql',
        'ui:placeholder': 'select * from table;',
        'ui:title': 'query.query1',
        'meta:isCode': true,
      },
      query2: {
        query2query1: {
          'ui:widget': 'sql',
          'ui:placeholder': 'select * from table;',
          'ui:title': 'query.query2.query2query1',
          'meta:isCode': true,
        },
        query2query2: {
          'ui:widget': 'sql',
          'ui:placeholder': 'select * from table;',
          'ui:title': 'query.query2.query2query2',
        },
      },
      query3: {
        'ui:widget': 'sql',
        'ui:placeholder': 'select * from table;',
        'ui:title': 'query.query3',
        'meta:isCode': true,
      },
      query4: {
        'ui:widget': 'sql',
        'ui:placeholder': 'select * from table;',
        'ui:title': 'query.query4',
        'meta:isCode': true,
      },
    },
  },
};
