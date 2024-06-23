ALTER TABLE "workspace_data_sources" ALTER COLUMN "config" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "workspace_data_sources" ALTER COLUMN "config" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "apps" ADD COLUMN "app_env" varchar DEFAULT 'development';