ALTER TABLE `users` ADD `google_id` varchar(120);--> statement-breakpoint
ALTER TABLE `users` ADD `reset_token_hash` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `reset_token_expires_at` timestamp;