DO $$ BEGIN
 CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'invited');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "components" DROP CONSTRAINT "components_parent_id_page_id_components_id_page_id_fk";
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status_enum" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "users_to_workspaces" ADD COLUMN "invitation_token" text;--> statement-breakpoint
ALTER TABLE "users_to_workspaces" ADD COLUMN "declined_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "components" ADD CONSTRAINT "components_parent_id_page_id_components_id_page_id_fk" FOREIGN KEY ("parent_id","page_id") REFERENCES "public"."components"("id","page_id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
