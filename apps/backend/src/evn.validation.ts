import { ConfigService } from '@nestjs/config';
import z from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string().min(8),
  DB_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

export type EnvSchema = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  return envSchema.parse(config);
}

/**
 * just a wrapper around ConfigService to add the generic instead of writing it everywhere we need typed configService
 */
export type TConfigService = ConfigService<EnvSchema, true>;
