CREATE TABLE `market_prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metalId` int NOT NULL,
	`priceUsd` decimal(10,4),
	`source` varchar(100),
	`fetchedAt` timestamp DEFAULT (now()),
	CONSTRAINT `market_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` varchar(50),
	`description` text,
	`unit` varchar(20) DEFAULT 'lb',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `metals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metalId` int NOT NULL,
	`priceUsd` decimal(10,4),
	`recordedAt` timestamp DEFAULT (now()),
	CONSTRAINT `price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `users_stripe` (
	`userId` int NOT NULL,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`currentPlan` enum('scout','pro','yard_command','none') DEFAULT 'none',
	`foundingPartner` int DEFAULT 0,
	`priceLockedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_stripe_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `yard_prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`yardId` int NOT NULL,
	`metalId` int NOT NULL,
	`priceUsd` decimal(10,4),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `yard_prices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `yards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200),
	`location` varchar(300),
	`contactName` varchar(100),
	`email` varchar(200),
	`phone` varchar(50),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `yards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `market_prices` ADD CONSTRAINT `market_prices_metalId_metals_id_fk` FOREIGN KEY (`metalId`) REFERENCES `metals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `price_history` ADD CONSTRAINT `price_history_metalId_metals_id_fk` FOREIGN KEY (`metalId`) REFERENCES `metals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users_stripe` ADD CONSTRAINT `users_stripe_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `yard_prices` ADD CONSTRAINT `yard_prices_yardId_yards_id_fk` FOREIGN KEY (`yardId`) REFERENCES `yards`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `yard_prices` ADD CONSTRAINT `yard_prices_metalId_metals_id_fk` FOREIGN KEY (`metalId`) REFERENCES `metals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `yards` ADD CONSTRAINT `yards_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `metalId_idx` ON `market_prices` (`metalId`);--> statement-breakpoint
CREATE INDEX `metalId_idx` ON `price_history` (`metalId`);--> statement-breakpoint
CREATE INDEX `yardId_idx` ON `yard_prices` (`yardId`);--> statement-breakpoint
CREATE INDEX `metalId_idx` ON `yard_prices` (`metalId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `yards` (`userId`);