import { z } from 'zod';

export const postgresqlConfigSchema = z.object({
  user: z.string(),
  host: z.string(),
  port: z.number(),
  database: z.string(),
  password: z.string(),
  ssl: z.any(),
  sslCertificate: z.string(),
  connectionOptions: z.string(),
});
export type PostgresqlConfigT = z.infer<typeof postgresqlConfigSchema>;