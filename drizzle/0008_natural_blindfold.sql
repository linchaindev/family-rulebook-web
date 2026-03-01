CREATE TABLE `bug_report_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comment_id` int NOT NULL,
	`member_id` varchar(20) NOT NULL,
	`reward_amount` int NOT NULL,
	`verified_by` varchar(50) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bug_report_rewards_id` PRIMARY KEY(`id`)
);
