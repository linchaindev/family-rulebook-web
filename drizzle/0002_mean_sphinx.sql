CREATE TABLE `passwords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` varchar(7) NOT NULL,
	`manager_password` varchar(4) NOT NULL,
	`auditor_password` varchar(6) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `passwords_id` PRIMARY KEY(`id`),
	CONSTRAINT `passwords_month_unique` UNIQUE(`month`)
);
