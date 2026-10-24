CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`assignee_id` int,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`status` enum('PENDING','PROCESSING','AUTO_RESOLVED','REVIEW_REQUIRED','FAILED') NOT NULL DEFAULT 'PENDING',
	`priority` enum('HIGH','MEDIUM','LOW'),
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now())
);
--> statement-breakpoint
CREATE TABLE `inquiry_events` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`inquiry_id` int NOT NULL,
	`user_id` int,
	`event_type` enum('CREATED','UPDATED','DELETED','STATUS_CHANGED') NOT NULL,
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now())
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`email` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_unique` UNIQUE INDEX(`email`)
);
