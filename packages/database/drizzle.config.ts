import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/**",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DB_URL as string,
  },
  out: "./drizzle",
  verbose: true,
  strict: true,
} satisfies Config;
