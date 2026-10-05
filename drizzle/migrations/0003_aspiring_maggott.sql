ALTER TABLE `smart_cvs` ADD `slug` text;--> statement-breakpoint
ALTER TABLE `smart_cvs` ADD `is_public` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `smart_cvs` ADD `views_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `smart_cvs_slug_unique` ON `smart_cvs` (`slug`);--> statement-breakpoint
CREATE INDEX `smart_cvs_slug_idx` ON `smart_cvs` (`slug`);