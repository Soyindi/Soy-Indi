CREATE TABLE `affiliate_bank_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`bank_name` text NOT NULL,
	`account_type` text NOT NULL,
	`account_number` text NOT NULL,
	`rut` text NOT NULL,
	`holder_name` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `affiliate_bank_accounts_user_id_unique` ON `affiliate_bank_accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `affiliate_bank_accounts_user_idx` ON `affiliate_bank_accounts` (`user_id`);--> statement-breakpoint
CREATE TABLE `affiliate_commissions` (
	`id` text PRIMARY KEY NOT NULL,
	`affiliate_user_id` text NOT NULL,
	`buyer_user_id` text NOT NULL,
	`payment_id` text NOT NULL,
	`amount_clp` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`paid_at` integer,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`affiliate_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`buyer_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`payment_id`) REFERENCES `payments_history`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `affiliate_commissions_affiliate_user_idx` ON `affiliate_commissions` (`affiliate_user_id`);--> statement-breakpoint
CREATE INDEX `affiliate_commissions_status_idx` ON `affiliate_commissions` (`status`);--> statement-breakpoint
ALTER TABLE `user` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `referral_code` text;--> statement-breakpoint
ALTER TABLE `user` ADD `referred_by` text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_referral_code_unique` ON `user` (`referral_code`);