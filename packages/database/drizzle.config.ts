import { defineConfig } from "drizzle-kit";

console.log(process.env.DB_URL);
export default defineConfig({
  schema: "./src/schema/**",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL as string,
  },
  out: "./drizzle",
  verbose: true,
  strict: false,
});
