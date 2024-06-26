import { configDotenv } from "dotenv";
import { sql } from "drizzle-orm";
import { dbConnect } from "..";
async function main() {
  configDotenv();
  if (process.env.NODE_ENV === "production")
    throw new Error(
      "You're attempting to drop production DB 🧨. I just saved you from yourself. You're welcome."
    );
  const dbUrl = process.env.DB_URL;
  if (!dbUrl) throw new Error("missing env var to run DB_RESET (DB_URL)");
  const dbName = dbUrl.split("/").pop();
  console.log(`🚨 Dropping DB: ${dbName}`);
  const [db, client] = await dbConnect(dbUrl);
  try {
    const query = sql<string>`SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;

    const tables = await db.execute(query);
    for (const table of tables.rows) {
      const query = sql.raw(
        `DROP TABLE IF EXISTS ${table.table_name} CASCADE;`
      );
      await db.execute(query);
    }
  } catch (err) {
    client.end();
    throw err;
  }
}

main()
  .then(() => {
    console.log("✅ DB Reset complete ");
  })
  .catch((err) => {
    console.error("❌ Reset failed", err);
    throw err;
  })
  .finally(() => {
    process.exit();
  });
