CREATE TABLE `ddc_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`member_id` varchar(20) NOT NULL,
	`screen_time` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ddc_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('praise','suggestion') NOT NULL,
	`from_member` varchar(50) NOT NULL,
	`to_member` varchar(50) NOT NULL,
	`content` text NOT NULL,
	`date` varchar(10) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manager_activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` varchar(7) NOT NULL,
	`manager_id` varchar(20) NOT NULL,
	`wakeup_count` int NOT NULL DEFAULT 0,
	`academy_count` int NOT NULL DEFAULT 0,
	`homework_count` int NOT NULL DEFAULT 0,
	`sleep_count` int NOT NULL DEFAULT 0,
	`settlement_count` int NOT NULL DEFAULT 0,
	`evaluation_count` int NOT NULL DEFAULT 0,
	`o_votes` int NOT NULL DEFAULT 0,
	`reward` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `manager_activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rcr_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`member_id` varchar(20) NOT NULL,
	`level` enum('minor','moderate','major','maximum') NOT NULL,
	`reason` text NOT NULL,
	`applied_by` varchar(50) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rcr_records_id` PRIMARY KEY(`id`)
);
