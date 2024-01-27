import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

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

const headersSchema = z.array(
  z.tuple([z.string().describe('Key'), z.string().describe('Value')]),
);

export const configSchema = z.object({
  base_url: z.string().url({
    message: 'Invalid URL. Please enter a valid URL.',
  }),
  auth: authUnion,
  /**
   * headers that will be sent with every request
   * @note plugin headers has low percendence than query headers
   */
  headers: headersSchema,
});

const endpointMethods = z.union([
  z.literal('GET'),
  z.literal('POST'),
  z.literal('PUT'),
  z.literal('DELETE'),
]);

export const querySchema = z.object({
  endpoint: z.string(),
  method: endpointMethods,
  headers: headersSchema,
  params: headersSchema,
  // TODO: the plugin needs to be able to handle any body type
  body: z.union([z.string(), z.record(z.unknown())]),
});

export type ConfigT = z.infer<typeof configSchema>;
export type QueryT = z.infer<typeof querySchema>;

export const pluginConfigForm = {
  schema: zodToJsonSchema(configSchema, 'configSchema'),
  uiSchema: {
    base_url: {
      'ui:placeholder': 'https://restapi/',
      'ui:title': 'Base Url',
    },
    auth: {
      'ui:title': 'Auth',
    },
    auth_type: {
      'ui:widget': 'select',
    },
    headers: {
      'ui:title': 'Headers',
    },
  },
};

export const queryConfigForm = {
  schema: zodToJsonSchema(querySchema, 'querySchema'),
  uiSchema: {
    endpoint: {
      'ui:title': 'End-Point',
      'ui:placeholder': '/users',
    },

    method: {
      'ui:title': 'Method',
    },
    headers: {
      'ui:title': 'Headers',
    },
    params: {
      'ui:title': 'Params',
    },
    body: {
      'ui:title': 'Body',
      'ui:placeholder': '{"msg", "body"}',
    },
  },
};
