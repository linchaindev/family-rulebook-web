CREATE TABLE `monthly_managers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` varchar(7) NOT NULL,
	`manager_id` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monthly_managers_id` PRIMARY KEY(`id`),
	CONSTRAINT `monthly_managers_month_unique` UNIQUE(`month`)
);
