CREATE TABLE `system_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `payments_history` ADD `provider` text DEFAULT 'flow' NOT NULL;--> statement-breakpoint
ALTER TABLE `payments_history` ADD `provider_payment_id` text;--> statement-breakpoint
ALTER TABLE `payments_history` ADD `provider_subscription_id` text;--> statement-breakpoint
ALTER TABLE `payments_history` ADD `plan_tier` text DEFAULT 'pro' NOT NULL;--> statement-breakpoint
CREATE INDEX `payments_history_provider_idx` ON `payments_history` (`provider`);--> statement-breakpoint
CREATE INDEX `affiliate_commissions_buyer_user_idx` ON `affiliate_commissions` (`buyer_user_id`);--> statement-breakpoint
CREATE INDEX `affiliate_commissions_payment_idx` ON `affiliate_commissions` (`payment_id`);