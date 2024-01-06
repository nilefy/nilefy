import { z } from 'zod';
import { WidgetInspectorConfig } from '@webloom/configpaneltypes';

const authUnion = z.discriminatedUnion('auth_type', [
  z.object({
    auth_type: z.literal('none'),
  }),
  z.object({
    auth_type: z.literal('basic'),
    username: z.string(),
    password: z.string(),
  }),
  z.object({
    auth_type: z.literal('bearer'),
    bearer_token: z.string(),
  }),
]);

export const configSchema = z.object({
  base_url: z.string().url({
    message: 'Invalid URL. Please enter a valid URL.',
  }),
  auth: authUnion,
  /**
   * headers that will be sent with every request
   * @note plugin headers has low percendence than query headers
   */
  headers: z.record(z.string()),
});

// TODO: i let this type as reference(will be useful when we enable oauth)
// export const configSchema = z.object({
//   base_url: z.string().url({
//     message: 'Invalid URL. Please enter a valid URL.',
//   }),
//   bearer_token: z.string(),
//   auth_type: z.string(), // bearer | basic | oauth2
//   method: z.string(),
//   scope: z.string(),
//   username: z.string(),
//   password: z.string(),
//   grant_type: z.string(),
//   add_token_to: z.string(),
//   header_prefix: z.string(),
//   access_token_url: z.string(),
//   client_id: z.string(),
//   client_secret: z.object({
//     type: z.string(),
//     encrypted: z.boolean(),
//   }),
//   scopes: z.string(),
//   auth_url: z.string(),
//   client_auth: z.string(),
//   headers: z.object({
//     type: z.array(z.any()),
//   }),
//   client_key: z.object({
//     encrypted: z.boolean(),
//   }),
//   client_cert: z.object({
//     encrypted: z.boolean(),
//   }),
// });

const endpointMethods = z.union([
  z.literal('GET'),
  z.literal('POST'),
  z.literal('PUT'),
  z.literal('POST'),
  z.literal('DELETE'),
]);
export const querySchema = z.object({
  endpoint: z.string(),
  method: endpointMethods,
  headers: z.record(z.string()),
  params: z.record(z.unknown()),
  // TODO: the plugin needs to be able to handle any body type
  body: z.union([z.string(), z.record(z.unknown())]),
});

export type ConfigT = z.infer<typeof configSchema>;
export type QueryT = z.infer<typeof querySchema>;

export const pluginConfigForm: WidgetInspectorConfig<ConfigT> = [
  {
    sectionName: 'Development',
    children: [
      {
        id: 'rest-api-baseurl',
        key: 'base_url',
        label: 'Base Url',
        type: 'input',
        options: {
          placeholder: 'https://restapi/',
          type: 'text',
        },
      },
      {
        id: 'rest-api-auth',
        key: 'auth',
        label: 'Auth',
        // TODO: use form control that can handle unions
        type: 'input',
        options: {},
      },
      {
        id: 'rest-api-headers',
        key: 'headers',
        label: 'Headers',
        // TODO: use form control that can handle this type
        type: 'input',
        options: {},
      },
    ],
  },
];

export const queryConfigForm: WidgetInspectorConfig<QueryT> = [
  {
    sectionName: '',
    children: [
      {
        id: 'rest-query-endpoint',
        key: 'endpoint',
        label: 'End-Point',
        type: 'input',
        options: { placeholder: '/users', type: 'text' },
      },
      {
        id: 'rest-query-method',
        key: 'method',
        label: 'Method',
        type: 'select',
        options: {
          items: endpointMethods.options.map((i) => ({
            label: i.value,
            value: i.value,
          })),
        },
      },
      {
        id: 'rest-query-headers',
        key: 'headers',
        label: 'Headers',
        // TODO: use form control that can handle this type
        type: 'input',
        options: {},
      },
      {
        id: 'rest-query-params',
        key: 'params',
        label: 'Params',
        // todo: use form control that can handle this type
        type: 'input',
        options: {},
      },
      {
        id: 'rest-query-body',
        key: 'body',
        label: 'Body',
        // todo: use form control that can handle this type
        type: 'input',
        options: { type: 'text', placeholder: '{"msg", "body"}' },
      },
    ],
  },
];
