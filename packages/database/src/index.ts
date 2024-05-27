import {
  drizzle,
  NodePgDatabase,
  NodePgQueryResultHKT,
} from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema/schema";
import * as appStateSchema from "./schema/appsState.schema";
import * as ds_schema from "./schema/data_sources.schema";
import * as relations from "./schema/relations";
import { PgTransaction } from "drizzle-orm/pg-core";
import { ExtractTablesWithRelations, sql } from "drizzle-orm";
export * from "./schema/schema";
export * from "./schema/appsState.schema";
export * from "./schema/data_sources.schema";
export * from "./schema/relations";
export type SchemaT = typeof schema &
  typeof ds_schema &
  typeof appStateSchema &
  typeof relations;
export type DatabaseI = NodePgDatabase<SchemaT>;
export type PgTrans = PgTransaction<
  NodePgQueryResultHKT,
  SchemaT,
  ExtractTablesWithRelations<SchemaT>
>;
export const DrizzleAsyncProvider = "drizzleProvider";

export async function dbConnect(
  connectionString: string
): Promise<[DatabaseI, Client]> {
  const client = new Client({
    connectionString: connectionString,
    
  });
  await client.connect();
  const db: DatabaseI = drizzle(client, {
    schema: { ...schema, ...appStateSchema, ...ds_schema, ...relations },
    logger: false,
  });
  await db.execute(sql`
      ALTER TABLE components
      DROP CONSTRAINT IF EXISTS components_parent_id_page_id_components_id_page_id_fk
  `);
  await db.execute(sql`  
      ALTER TABLE components
      ADD CONSTRAINT components_parent_id_page_id_components_id_page_id_fk
      FOREIGN KEY (parent_id, page_id)
      REFERENCES components(id, page_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
      DEFERRABLE INITIALLY DEFERRED;
  `); 
  return [db, client];
}
