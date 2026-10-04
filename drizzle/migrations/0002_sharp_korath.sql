CREATE TABLE `card_events` (
	`id` text PRIMARY KEY NOT NULL,
	`card_id` text NOT NULL,
	`event_type` text NOT NULL,
	`source` text DEFAULT 'direct' NOT NULL,
	`device` text DEFAULT 'mobile' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `card_events_card_idx` ON `card_events` (`card_id`);--> statement-breakpoint
CREATE INDEX `card_events_type_idx` ON `card_events` (`event_type`);--> statement-breakpoint
CREATE INDEX `card_events_created_idx` ON `card_events` (`created_at`);--> statement-breakpoint
ALTER TABLE `cards` ADD `address` text;