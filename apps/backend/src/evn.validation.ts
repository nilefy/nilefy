import { ConfigService } from '@nestjs/config';
import z from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string().min(8),
  RESEND_API_KEY: z.string(),
  DB_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  NODE_ENV: z.string(),
  SEND_TO: z.string(),
  ENCRYPTION_KEY: z.string(),
  BASE_URL_FE: z.string(),
  BASE_URL_BE: z.string(),
});

export type EnvSchema = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  return envSchema.parse(config);
}

/**
 * Typed configservice
 * just a wrapper around ConfigService to add the generic instead of writing it everywhere we need typed configService
 */
export class TConfigService extends ConfigService<EnvSchema, true> {}
