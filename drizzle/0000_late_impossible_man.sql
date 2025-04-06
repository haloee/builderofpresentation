CREATE TABLE `presentation_permissions` (
	`presentation_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`permission` varchar(10) NOT NULL,
	CONSTRAINT `presentation_permissions_presentation_id_user_id_pk` PRIMARY KEY(`presentation_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `presentations` (
	`id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `presentations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `slides` (
	`id` varchar(36) NOT NULL,
	`presentation_id` varchar(36) NOT NULL,
	`content` text NOT NULL,
	CONSTRAINT `slides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`username` varchar(50) NOT NULL,
	`email` varchar(100) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
