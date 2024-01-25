import { WidgetInspectorConfig } from '@webloom/configpaneltypes';
import { z } from 'zod';

export const configSchema = z.object({
  user: z.string(),
  host: z.string(),
  port: z.number().default(5432),
  database: z.string(),
  password: z.string(),
  ssl: z.boolean().default(false),
  sslCertificate: z.string().optional(),
  connectionOptions: z.string().optional(),
});

export type ConfigT = z.infer<typeof configSchema>;
export type QueryT = {
  query: string;
};

export const pluginConfigForm: WidgetInspectorConfig<ConfigT> = [
  {
    sectionName: 'Development',
    children: [
      {
        id: 'host',
        key: 'host',
        label: 'Host',
        type: 'input',
        options: {
          placeholder: 'localhost',
          type: 'text',
        },
      },
      {
        id: 'port',
        key: 'port',
        label: 'Port',
        type: 'input',
        options: {
          placeholder: 5432,
          type: 'number',
        },
      },
      {
        id: 'ssl',
        key: 'ssl',
        label: 'SSL',
        type: 'checkbox',
        options: {},
      },
      {
        id: 'database_name',
        key: 'database',
        label: 'Database Name',
        type: 'input',
        options: {
          placeholder: 'Name of the database',
          type: 'text',
        },
      },
      {
        id: 'username',
        key: 'user',
        label: 'Username',
        type: 'input',
        options: {
          placeholder: 'Enter username',
          type: 'text',
        },
      },
      {
        id: 'password',
        key: 'password',
        label: 'Password',
        type: 'input',
        options: {
          placeholder: 'Enter password',
          type: 'password',
        },
      },
      {
        id: 'certificate',
        key: 'sslCertificate',
        label: 'SSL Certificate',
        type: 'select',
        options: {
          items: [
            {
              label: 'CA Certificate',
              value: 'ca',
            },
            {
              label: 'Self-signed Certificate',
              value: 'self-signed',
            },
            {
              label: 'None',
              value: 'none',
            },
          ],
          placeholder: 'None',
        },
      },
      // TODO: add connection options key-value pairs
    ],
  },
];

export const queryConfigForm: WidgetInspectorConfig<QueryT> = [
  {
    sectionName: '',
    children: [
      {
        id: 'sql',
        key: 'query',
        label: 'SQL',
        type: 'sqlEditor',
        options: { placeholder: 'select * from table;' },
      },
    ],
  },
];
