import { z } from 'zod';

export const configSchema = z.object({
  user: z.string(),
  host: z.string(),
  port: z.number(),
  database: z.string(),
  password: z.string(),
  ssl: z.any(),
  sslCertificate: z.string(),
  connectionOptions: z.string(),
});

export type ConfigT = z.infer<typeof configSchema>;
