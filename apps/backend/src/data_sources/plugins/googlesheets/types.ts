import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export const configSchema = z.object({
  scope: z.union([
    z.object({
      value: z.literal('https://www.googleapis.com/auth/spreadsheets.readonly'),
      label: z.literal('Read'),
      description: z.literal('Read access to all Google Sheets'),
    }),
    z.object({
      value: z.literal('https://www.googleapis.com/auth/spreadsheets'),
      label: z.literal('Write'),
      description: z.literal('Write access to all Google Sheets'),
    }),
    z.object({
      value: z.literal('https://www.googleapis.com/auth/drive'),
      label: z.literal('Read / Write / Delete'),
      description: z.literal(
        'Read, write, and delete access to all Google Drive files',
      ),
    }),
    z.object({
      value: z.literal('https://www.googleapis.com/auth/drive.file'),
      label: z.literal('Read / Write / Delete'),
      description: z.literal(
        'Read, write, and delete access to files created by this app',
      ),
    }),
    z.object({
      value: z.literal('https://www.googleapis.com/auth/drive.readonly'),
      label: z.literal('Read'),
      description: z.literal('Read-only access to all Google Drive files'),
    }),
  ]),

  client_id: z.string().min(1),
  client_secret: z.string().min(1),
  access_token: z.string().min(1),
});

export const querySchema = z.object({
  sheetId: z.string().min(1),
  range: z.string().min(1),
});

export type ConfigT = z.infer<typeof configSchema>;
export type QueryT = z.infer<typeof querySchema>;

export const pluginConfigForm = {
  schema: zodToJsonSchema(configSchema, 'configSchema'),
  uiSchema: {
    scope: {
      'ui:placeholder': 'Choose an option',
      'ui:title': 'Scope',
    },
    client_id: {
      'ui:placeholder': 'Enter client id',
      'ui:widget': 'hidden',
    },
    client_secret: {
      'ui:placeholder': 'Enter client secret',
      'ui:widget': 'hidden',
    },
    access_token: {
      'ui:placeholder': 'Enter access token',
      'ui:widget': 'hidden',
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
          label: 'Sheet Id',
          type: 'input',
          options: {
            placeholder: 'Enter sheet id',
            label: 'Sheet Id',
          },
        },
        {
          path: 'config.query',
          label: 'Range',
          type: 'input',
          options: {
            placeholder: 'Enter range',
            label: 'Range',
          },
        },
      ],
    },
  ],
};
export const scopeMap = {
  'Read / Write / Delete | Selected Google Sheets':
    'https://www.googleapis.com/auth/drive.file',
  'Read / Write / Delete | All Google Sheets': [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ],
  'Read / Write | All Google Sheets': [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
  'Read | All Google Sheets': [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
};
