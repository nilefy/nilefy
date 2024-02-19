import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

export const configSchema = z.object({
  privateKey: z.string(),
});
/**
 * used to validate the parsed json
 */
export const parsedConfigSchema = z.object({
  type: z.literal('service_account'),
  project_id: z.string(),
  private_key_id: z.string(),
  private_key: z.string(),
  client_email: z.string().email(),
  client_id: z.string(),
  auth_uri: z.literal('https://accounts.google.com/o/oauth2/auth'),
  token_uri: z.literal('https://accounts.google.com/o/oauth2/token'),
  auth_provider_x509_cert_url: z.literal(
    'https://www.googleapis.com/oauth2/v1/certs',
  ),
  client_x509_cert_url: z.string().url(),
});

const query = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('Read file'),
    bucket: z.string(),
    file: z.string(),
  }),
  z.object({
    operation: z.literal('Upload file'),
    bucket: z.string(),
    filePath: z.string(),
  }),
  z.object({ operation: z.literal('List buckets') }),
  z.object({
    operation: z.literal('List files in a bucket'),
    bucket: z.string(),
    prefix: z.string().optional(),
  }),
  z.object({
    operation: z.literal('Download file'),
    bucket: z.string(),
    file: z.string(),
    destination: z.string().optional(),
  }),
]);
export const querySchema = z.object({
  query: query,
});

export type ConfigT = z.infer<typeof configSchema>;
export type ParsedConfigT = z.infer<typeof parsedConfigSchema>;
export type QueryT = z.infer<typeof querySchema>;

export const pluginConfigForm = {
  schema: zodToJsonSchema(configSchema, 'configSchema'),
  uiSchema: {
    privateKey: {
      'ui:placeholder': 'Enter JSON private key for service account',
      'ui:title': 'Private key',
    },
  },
};

export const queryConfigForm = {
  schema: zodToJsonSchema(querySchema, 'querySchema'),
  uiSchema: {
    operation: {
      'ui:title': 'Operation',
      'ui:widget': 'select',
    },
    bucket: {
      'ui:title': 'Bucket',
    },
    file: {
      'ui:title': 'File',
    },
  },
};
