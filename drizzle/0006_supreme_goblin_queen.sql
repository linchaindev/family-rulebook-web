CREATE TABLE `monthly_allowances` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` varchar(7) NOT NULL,
	`member_id` varchar(20) NOT NULL,
	`base_allowance` int NOT NULL DEFAULT 0,
	`bonus` int NOT NULL DEFAULT 0,
	`penalty` int NOT NULL DEFAULT 0,
	`final_allowance` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monthly_allowances_id` PRIMARY KEY(`id`)
);
