import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

const scopeKeys = [
  'Read / Write / Delete | Selected Google Sheets',
  'Read / Write / Delete | All Google Sheets',
  'Read / Write | All Google Sheets',
  'Read | All Google Sheets',
] as const;

export const scopeMap = {
  [scopeKeys[0]]: ['https://www.googleapis.com/auth/drive.file'],
  [scopeKeys[1]]: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ],
  [scopeKeys[2]]: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
  [scopeKeys[3]]: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly',
  ],
} as const;

export const configSchema = z.object({
  scope: z.enum(scopeKeys),
  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
});

const ops = [
  z.literal('info'), // 0
  z.literal('read'), // 1
  z.literal('append'), // 2
  z.literal('update'), // 3
  z.literal('delete_row'), // 4
] as const;
const operationOptions = z.union(ops).default('read');

const querySpreadsheet_idSchema = z.string();
const querySpreadsheet_rangeSchema = z.string();
/**
 * sheet name
 */
const querySheetSchema = z.coerce.number().default(0);
const queryRowsSchema = z.array(z.unknown());
const queryWhere_fieldSchema = z.string();
const queryWhere_operationSchema = z.string();
const queryWhere_valueSchema = z.string();
const queryBodySchema = z.string();
const queryRow_indexSchema = z.number();

export const querySchema = z.discriminatedUnion('operation', [
  z.object({
    // info 0
    operation: ops[0],
    spreadsheet_id: querySpreadsheet_idSchema,
  }),
  z.object({
    // read 1
    operation: ops[1],
    spreadsheet_id: querySpreadsheet_idSchema,
    spreadsheet_range: querySpreadsheet_rangeSchema,
    sheet: querySheetSchema,
  }),
  z.object({
    // append 2
    operation: ops[2],
    spreadsheet_id: querySpreadsheet_idSchema,
    sheet: querySheetSchema,
    rows: queryRowsSchema,
  }),
  z.object({
    // update 3
    operation: ops[3],
    spreadsheet_id: querySpreadsheet_idSchema,
    spreadsheet_range: querySpreadsheet_rangeSchema,
    sheet: querySheetSchema,
    where_field: queryWhere_fieldSchema,
    where_operation: queryWhere_operationSchema,
    where_value: queryWhere_valueSchema,
    body: queryBodySchema,
  }),
  z.object({
    // delete row 4
    operation: ops[4],
    spreadsheet_id: querySpreadsheet_idSchema,
    sheet: querySheetSchema,
    row_index: queryRow_indexSchema,
  }),
]);

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
      'ui:encrypted': 'encrypted',
    },
    refresh_token: {
      'ui:widget': 'hidden',
      'ui:encrypted': 'encrypted',
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
              { value: ops[0].value, label: 'Get spreadsheet info' },
              { value: ops[1].value, label: 'Read data from a spreadsheet' },
              { value: ops[2].value, label: 'Append data to a spreadsheet' },
              { value: ops[3].value, label: 'Update data to a spreadsheet' },
              { value: ops[4].value, label: 'Delete row from a spreadsheet' },
            ],
          },
          validation: zodToJsonSchema(operationOptions),
        },
        {
          path: 'config.spreadsheet_id',
          label: 'Spreadsheet Sheet ID',
          type: 'inlineCodeInput',
          options: {
            placeholder: 'Enter Spreadsheet id',
            label: 'SpreadSheet Sheet ID',
          },
          validation: zodToJsonSchema(querySpreadsheet_idSchema),
        },
        {
          path: 'config.spreadsheet_range',
          label: 'Range',
          type: 'inlineCodeInput',
          options: {
            placeholder: 'Enter range',
            label: 'Range',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'IN',
                value: [ops[0].value, ops[2].value, ops[4].value],
              },
            ],
          },
          validation: zodToJsonSchema(querySpreadsheet_rangeSchema),
        },
        {
          path: 'config.sheet',
          label: 'Sheet ID',
          type: 'inlineCodeInput',
          options: {
            placeholder: 'Sheet Id i.e 2016001036',
            label: 'sheet id',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'IN',
                value: [ops[0].value],
              },
            ],
          },
          validation: zodToJsonSchema(querySheetSchema),
        },
        {
          path: 'config.rows',
          label: 'rows',
          type: 'inlineCodeInput',
          options: {
            label: 'rows',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_EQUALS',
                value: ops[2].value,
              },
            ],
          },
          validation: zodToJsonSchema(queryRowsSchema),
        },
        {
          path: 'config.where_fieldsheet name',
          label: 'where field',
          type: 'inlineCodeInput',
          options: {
            placeholder: 'Field Name',
            label: 'where field',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_EQUALS',
                value: ops[3].value,
              },
            ],
          },
          validation: zodToJsonSchema(queryWhere_fieldSchema),
        },
        {
          path: 'config.where_operation',
          label: 'where operation',
          type: 'inlineCodeInput',
          options: {
            placeholder: '==',
            label: 'where operation',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_EQUALS',
                value: ops[3].value,
              },
            ],
          },
          validation: zodToJsonSchema(queryWhere_operationSchema),
        },
        {
          path: 'config.where_value',
          label: 'where value',
          type: 'inlineCodeInput',
          options: {
            label: 'where value',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_EQUALS',
                value: ops[3].value,
              },
            ],
          },
          validation: zodToJsonSchema(queryWhere_valueSchema),
        },
        {
          path: 'config.body',
          label: 'body',
          type: 'inlineCodeInput',
          options: {
            label: 'body',
          },
          hidden: {
            conditionType: 'OR',
            conditions: [
              {
                path: 'config.operation',
                comparison: 'NOT_EQUALS',
                value: ops[3].value,
              },
            ],
          },
          validation: zodToJsonSchema(queryBodySchema),
        },
        {
          path: 'config.row_index',
          label: 'row index',
          type: 'inlineCodeInput',
          options: {
            label: 'row index',
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
          validation: zodToJsonSchema(queryRow_indexSchema),
        },
      ],
    },
  ],
};
