CREATE TABLE `billing_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(128) NOT NULL,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`subscriptionStatus` varchar(32),
	`currentPeriodEnd` timestamp,
	`freeCorrectionUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `billing_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `billing_accounts_openId_unique` UNIQUE(`openId`)
);
