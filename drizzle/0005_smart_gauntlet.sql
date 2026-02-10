CREATE TABLE `manager_activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`member_id` varchar(20) NOT NULL,
	`activity_type` enum('tardiness','absence','homework_incomplete','rule_violation','other') NOT NULL,
	`comment` text NOT NULL,
	`recorded_by` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `manager_activity_logs_id` PRIMARY KEY(`id`)
);
