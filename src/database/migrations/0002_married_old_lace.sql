CREATE TABLE IF NOT EXISTS "individuals" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"prompt" text NOT NULL,
	"small_image_path" varchar(500) NOT NULL,
	"full_image_path" varchar(500) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
