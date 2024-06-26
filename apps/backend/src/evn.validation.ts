import { ConfigService } from '@nestjs/config';
import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  JWT_SECRET: z.string().min(8),
  RESEND_API_KEY: z.string(),
  RESEND_SEND_FROM_EMAIL: z.string(),
  RESEND_SEND_TO_DEV_EMAIL: z.string(),
  DB_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  ENCRYPTION_KEY: z.string(),
  BASE_URL_FE: z.string().url(),
  BASE_URL_BE: z.string().url(),
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
