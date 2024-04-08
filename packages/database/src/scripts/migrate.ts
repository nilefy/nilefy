import { migrate } from "drizzle-orm/node-postgres/migrator";
import { dbConnect } from "..";

async function main() {
  const [db, client] = await dbConnect(process.env.DB_URL as string);
  console.log(`🚀 Migrating DB: ${process.env.DB_URL}`);
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
  } catch (err) {
    await client.end();
    throw err;
  }
}

main()
  .then(() => {
    console.log("✅ Migration complete ");
  })
  .catch((err) => {
    console.log("❌ Migration failed", err);
  });
