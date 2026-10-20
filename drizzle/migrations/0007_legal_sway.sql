CREATE TABLE `card_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`card_id` text NOT NULL,
	`owner_user_id` text NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`company` text,
	`note` text,
	`ip_hash` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `card_leads_card_id_idx` ON `card_leads` (`card_id`);--> statement-breakpoint
CREATE INDEX `card_leads_owner_user_id_idx` ON `card_leads` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `card_leads_created_at_idx` ON `card_leads` (`created_at`);