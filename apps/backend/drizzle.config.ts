import type { Config } from 'drizzle-kit';

export default {
  schema: './src/drizzle/schema/**',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DB_URL as string,
  },
  out: './drizzle',
} satisfies Config;
