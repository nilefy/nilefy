import z from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string().min(8),
});

export type EnvSchema = z.infer<typeof envSchema>;

export function validate(config: Record<string, unknown>) {
  return envSchema.parse(config);
}

