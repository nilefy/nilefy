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
  schema: {
    type: 'object',
    properties: {
      base_url: {
        type: 'string',
        format: 'uri',
      },
      auth: {
        type: 'object',
        properties: {
          auth_type: {
            type: 'string',
            enum: ['none', 'basic', 'bearer'],
            default: 'none',
          },
        },
        required: ['auth_type'],
        dependencies: {
          auth_type: {
            oneOf: [
              {
                properties: {
                  auth_type: {
                    enum: ['none'],
                  },
                },
              },
              {
                properties: {
                  auth_type: {
                    enum: ['basic'],
                  },
                  username: {
                    type: 'string',
                  },
                  password: {
                    type: 'string',
                  },
                },
                required: ['username', 'password'],
              },
              {
                properties: {
                  auth_type: {
                    enum: ['bearer'],
                  },
                  bearer_token: {
                    type: 'string',
                  },
                },
                required: ['bearer_token'],
              },
            ],
          },
        },
      },
      headers: {
        type: 'array',
        items: {
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: [
            {
              type: 'string',
              description: 'Key',
            },
            {
              type: 'string',
              description: 'Value',
            },
          ],
        },
      },
    },
    required: ['base_url', 'auth', 'headers'],
    additionalProperties: false,
  },
  uiSchema: {
    base_url: {
      'ui:placeholder': 'https://restapi/',
      'ui:title': 'Base Url',
    },
    auth: {
      'ui:title': 'Auth',
      password: {
        'ui:widget': 'password',
      },
    },
    headers: {
      'ui:title': 'Headers',
      'ui:options': {
        orderable: false,
      },
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
      'ui:options': {
        orderable: false,
      },
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
