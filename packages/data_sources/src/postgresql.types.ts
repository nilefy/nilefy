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
export const postgresqlQueryConfigSchema = z.object({
  dataSourceId: z.number(),
  sql: z.string().min(1),
});

export type PostgresqlConfigT = z.infer<typeof postgresqlConfigSchema>;
export type PostgresqlQueryConfigT = z.infer<typeof postgresqlQueryConfigSchema>;