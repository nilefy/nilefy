import type { Config } from 'drizzle-kit';

export default {
  schema: './src/drizzle/schema/schema.ts',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DB_URL as string,
  },
} satisfies Config;
