ALTER TABLE "users" ADD COLUMN "avatar_url" text;
--> statement-breakpoint
GRANT SELECT (avatar_url) ON users TO wc_app;
