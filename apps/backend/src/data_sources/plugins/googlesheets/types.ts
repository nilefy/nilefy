import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export const configSchema = z.object({
  scope: z.enum([
    'Read / Write / Delete | Selected Google Sheets',
    'Read / Write / Delete | All Google Sheets',
    'Read / Write | All Google Sheets',
    'Read | All Google Sheets',
  ]),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
});

const querySchema = z.object({
  spreadsheet_id: z.string(),
  spreadsheet_range: z.string(),
  where_operation: z.string(),
  where_field: z.string(),
  where_value: z.string(),
  order_field: z.string(),
  order_type: z.string(),
  body: z.string(),
  sheet: z.string(),
  row_index: z.string(),
  operation: z.string(),
  rows: z.array(z.unknown()),
});

export type ConfigT = z.infer<typeof configSchema>;
export type QueryT = z.infer<typeof querySchema>;

export const pluginConfigForm = {
  schema: zodToJsonSchema(configSchema, 'configSchema'),
  uiSchema: {
    scope: {
      'ui:placeholder': 'Choose an option',
      'ui:title': 'Scope',
      'ui:widget': 'select',
      'ui:options': {
        enum_titles: [
          'Read / Write / Delete | Selected Google Sheets',
          'Read / Write / Delete | All Google Sheets',
          'Read / Write | All Google Sheets',
          'Read | All Google Sheets',
        ],
      },
    },
    access_token: {
      'ui:widget': 'hidden',
    },
    refresh_token: {
      'ui:widget': 'hidden',
    },
  },
};

const operationOptions = z.union([
  z.literal('info'),
  z.literal('read'),
  z.literal('append'),
  z.literal('update'),
  z.literal('delete_row'),
]);
export const queryConfigForm = {
  formConfig: [
    {
      sectionName: 'Basic',
      children: [
        {
          path: 'config.spreadsheet_id',
          label: 'Sheet Id',
          type: 'input',
          options: {
            placeholder: 'Enter sheet id',
            label: 'Sheet Id',
          },
        },
        {
          path: 'config.spreadsheet_range',
          label: 'Range',
          type: 'input',
          options: {
            placeholder: 'Enter range',
            label: 'Range',
          },
        },
        {
          path: 'config.operation',
          label: 'Operation',
          type: 'select',
          options: {
            items: [
              { value: 'info', label: 'Get spreadsheet info' },
              { value: 'read', label: 'Read data from a spreadsheet' },
              { value: 'append', label: 'Append data to a spreadsheet' },
              { value: 'update', label: 'Update data to a spreadsheet' },
              { value: 'delete', label: 'Delete row from a spreadsheet' },
            ],
          },
          validation: zodToJsonSchema(operationOptions),
        },
      ],
    },
  ],
};
export const scopeMap: Record<string, string[]> = {
  'Read / Write / Delete | Selected Google Sheets': [
    'https://www.googleapis.com/auth/drive.file',
  ],
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
