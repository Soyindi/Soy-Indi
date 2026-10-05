CREATE TABLE `payments_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_interval` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'CLP' NOT NULL,
	`status` text NOT NULL,
	`payment_method_id` text,
	`external_reference` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `payments_history_user_idx` ON `payments_history` (`user_id`);--> statement-breakpoint
CREATE INDEX `payments_history_status_idx` ON `payments_history` (`status`);