CREATE TABLE `presentation_comments` (
	`id` varchar(36) NOT NULL,
	`presentation_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`content` text NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `presentation_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `presentation_comments` ADD CONSTRAINT `presentation_comments_presentation_id_presentations_id_fk` FOREIGN KEY (`presentation_id`) REFERENCES `presentations`(`id`) ON DELETE cascade ON UPDATE no action;