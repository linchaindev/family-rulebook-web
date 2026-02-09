CREATE TABLE `manager_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` varchar(7) NOT NULL,
	`manager_id` varchar(20) NOT NULL,
	`voter_id` varchar(20) NOT NULL,
	`vote` enum('good','bad') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manager_evaluations_id` PRIMARY KEY(`id`)
);
