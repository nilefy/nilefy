import { z } from 'zod';

export const configSchema = z.object({
  host: z.string(),
  port: z.number(),
  databaseName: z.string(),
  username: z.string(),
  password: z.string(),
  ssl: z.boolean(),
  sslCertificate: z.string(),
  connectionOptions: z.string(),
});

export type ConfigT = z.infer<typeof configSchema>;
