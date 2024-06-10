ALTER TYPE "permissions_enum" ADD VALUE 'Datasources-Write';--> statement-breakpoint
ALTER TYPE "permissions_enum" ADD VALUE 'Datasources-Delete';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appsToRoles" (
	"app_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"permission" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "appsToRoles_app_id_role_id_pk" PRIMARY KEY("app_id","role_id")
);
--> statement-breakpoint
ALTER TABLE "components" DROP CONSTRAINT "components_page_id_pages_id_fk";
--> statement-breakpoint
ALTER TABLE "app_js_libraries" DROP CONSTRAINT "app_js_libraries_app_id_apps_id_fk";
--> statement-breakpoint
ALTER TABLE "pages" DROP CONSTRAINT "pages_app_id_apps_id_fk";
--> statement-breakpoint
ALTER TABLE "app_js_queries" DROP CONSTRAINT "app_js_queries_app_id_apps_id_fk";
--> statement-breakpoint
ALTER TABLE "workspace_app_queries" DROP CONSTRAINT "workspace_app_queries_app_id_apps_id_fk";
--> statement-breakpoint
ALTER TABLE "workspace_data_sources" DROP CONSTRAINT "workspace_data_sources_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "workspace_app_queries" ALTER COLUMN "data_source_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "app_js_queries" ADD COLUMN "trigger_mode" "queries_trigger_mode" DEFAULT 'manually' NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_app_queries" ADD COLUMN "base_data_source_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_token" varchar(256);--> statement-breakpoint
ALTER TABLE "users_to_roles" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users_to_roles" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appsToRoles" ADD CONSTRAINT "appsToRoles_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appsToRoles" ADD CONSTRAINT "appsToRoles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "components" ADD CONSTRAINT "components_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "app_js_libraries" ADD CONSTRAINT "app_js_libraries_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pages" ADD CONSTRAINT "pages_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "app_js_queries" ADD CONSTRAINT "app_js_queries_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_app_queries" ADD CONSTRAINT "workspace_app_queries_base_data_source_id_data_sources_id_fk" FOREIGN KEY ("base_data_source_id") REFERENCES "public"."data_sources"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_app_queries" ADD CONSTRAINT "workspace_app_queries_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspace_data_sources" ADD CONSTRAINT "workspace_data_sources_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "pages" DROP COLUMN IF EXISTS "deleted_at";--> statement-breakpoint
ALTER TABLE "apps" DROP COLUMN IF EXISTS "deleted_at";--> statement-breakpoint
ALTER TABLE "roles" DROP COLUMN IF EXISTS "deleted_at";