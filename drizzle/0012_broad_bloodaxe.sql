CREATE TABLE `auditor_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`password` varchar(6) NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `auditor_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `passwords` DROP COLUMN `auditor_password`;