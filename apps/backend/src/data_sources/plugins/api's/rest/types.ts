import { z } from 'zod';

export const configSchema = z.object({
  url: z.string().url({
    message: 'Invalid URL. Please enter a valid URL.',
  }),
  bearer_token: z.string(),
  auth_type: z.string(), // get | post | put
  method: z.string(),
  grant_type: z.string(),
  add_token_to: z.string(),
  header_prefix: z.string(),
  access_token_url: z.string(),
  client_id: z.string(),
  client_secret: z.object({
    type: z.string(),
    encrypted: z.boolean(),
  }),
  scopes: z.string(),
  auth_url: z.string(),
  client_auth: z.string(),
  headers: z.object({
    type: z.array(z.any()),
  }),
  client_key: z.object({
    encrypted: z.boolean(),
  }),
  client_cert: z.object({
    encrypted: z.boolean(),
  }),
});

export type ConfigT = z.infer<typeof configSchema>;
