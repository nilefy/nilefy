DO $$ BEGIN
 CREATE TYPE "public"."user_to_workspace_status" AS ENUM('active', 'invited', 'declined', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users_to_workspaces" ADD COLUMN "status" "user_to_workspace_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "users_to_workspaces" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users_to_workspaces" ADD COLUMN "updated_at" timestamp;