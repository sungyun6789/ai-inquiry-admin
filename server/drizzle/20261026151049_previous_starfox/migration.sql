ALTER TABLE `inquiry_events` MODIFY COLUMN `event_type` enum('CREATED','UPDATED','DELETED') NOT NULL;--> statement-breakpoint
ALTER TABLE `inquiries` DROP COLUMN `status`;