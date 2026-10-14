-- CreateTable
CREATE TABLE `Bot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `shardId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL,
    `discriminator` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `bot` BOOLEAN NULL DEFAULT false,
    `createdTimestamp` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Users_accountId_key`(`accountId`),
    INDEX `Users_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Guilds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildId` VARCHAR(191) NOT NULL,
    `available` BOOLEAN NOT NULL,
    `createdTimestamp` VARCHAR(191) NOT NULL,
    `joinedTimestamp` VARCHAR(191) NOT NULL,
    `large` BOOLEAN NOT NULL,
    `maximumMembers` INTEGER NULL,
    `maximumPresences` INTEGER NULL,
    `memberCount` INTEGER NULL,
    `partnered` BOOLEAN NOT NULL,
    `prefix` VARCHAR(191) NOT NULL DEFAULT '!',
    `premiumSubscriptionCount` INTEGER NULL,
    `premiumTier` VARCHAR(191) NOT NULL,
    `verified` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Guilds_guildId_key`(`guildId`),
    INDEX `Guilds_guildId_idx`(`guildId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Channels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channelId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nsfw` BOOLEAN NOT NULL,
    `topic` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdTimestamp` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Channels_channelId_key`(`channelId`),
    INDEX `Channels_channelId_idx`(`channelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `messageId` VARCHAR(191) NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(4000) NULL,
    `url` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Messages_messageId_key`(`messageId`),
    INDEX `Messages_messageId_idx`(`messageId`),
    INDEX `Messages_guildId_idx`(`guildId`),
    INDEX `Messages_channelId_idx`(`channelId`),
    INDEX `Messages_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Infractions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(4000) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `expires` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Infractions_guildId_idx`(`guildId`),
    INDEX `Infractions_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Moderators` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Moderators_guildId_idx`(`guildId`),
    INDEX `Moderators_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuildSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildId` VARCHAR(191) NOT NULL,
    `afkChannelID` VARCHAR(191) NULL,
    `afkTimeout` INTEGER NULL,
    `bannerURL` VARCHAR(191) NULL,
    `defaultMessageNotifications` VARCHAR(191) NOT NULL,
    `description` VARCHAR(130) NULL,
    `explicitContentFilter` VARCHAR(191) NOT NULL,
    `iconURL` VARCHAR(191) NULL,
    `mfaLevel` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAcronym` VARCHAR(191) NOT NULL,
    `ownerID` VARCHAR(191) NOT NULL,
    `preferredLocale` VARCHAR(191) NOT NULL,
    `rulesChannelID` VARCHAR(191) NULL,
    `shardID` INTEGER NOT NULL,
    `splashURL` VARCHAR(191) NULL,
    `systemChannelID` VARCHAR(191) NULL,
    `publicUpdatesChannelId` VARCHAR(191) NULL,
    `vanityURLCode` VARCHAR(191) NULL,
    `verificationLevel` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GuildSettings_guildId_key`(`guildId`),
    INDEX `GuildSettings_guildId_idx`(`guildId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuildMembers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `memberId` VARCHAR(191) NOT NULL,
    `bannable` BOOLEAN NOT NULL,
    `displayColor` INTEGER NOT NULL,
    `displayHexColor` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NULL,
    `joinedTimestamp` VARCHAR(191) NULL,
    `kickable` BOOLEAN NOT NULL,
    `manageable` BOOLEAN NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `premiumSinceTimestamp` BIGINT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GuildMembers_accountId_key`(`accountId`),
    UNIQUE INDEX `GuildMembers_memberId_key`(`memberId`),
    INDEX `GuildMembers_guildId_idx`(`guildId`),
    INDEX `GuildMembers_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuildLogs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildId` VARCHAR(191) NOT NULL,
    `delete_log` VARCHAR(191) NULL,
    `edit_log` VARCHAR(191) NULL,
    `goodbye_log` VARCHAR(191) NULL,
    `goodbye_message` VARCHAR(191) NULL,
    `infractions_log` VARCHAR(191) NULL,
    `join_role` VARCHAR(191) NULL,
    `mute_role` VARCHAR(191) NULL,
    `welcome_log` VARCHAR(191) NULL,
    `welcome_message` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GuildLogs_guildId_key`(`guildId`),
    UNIQUE INDEX `GuildLogs_delete_log_key`(`delete_log`),
    UNIQUE INDEX `GuildLogs_edit_log_key`(`edit_log`),
    UNIQUE INDEX `GuildLogs_goodbye_log_key`(`goodbye_log`),
    UNIQUE INDEX `GuildLogs_infractions_log_key`(`infractions_log`),
    UNIQUE INDEX `GuildLogs_join_role_key`(`join_role`),
    UNIQUE INDEX `GuildLogs_mute_role_key`(`mute_role`),
    UNIQUE INDEX `GuildLogs_welcome_log_key`(`welcome_log`),
    INDEX `GuildLogs_guildId_idx`(`guildId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuildChannels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildId` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `deletable` BOOLEAN NOT NULL,
    `manageable` BOOLEAN NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `permissionsLocked` BOOLEAN NULL,
    `position` INTEGER NULL,
    `rawPosition` INTEGER NOT NULL,
    `viewable` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GuildChannels_channelId_key`(`channelId`),
    INDEX `GuildChannels_guildId_idx`(`guildId`),
    INDEX `GuildChannels_channelId_idx`(`channelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ThreadChannels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `threadId` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,
    `threadName` VARCHAR(191) NOT NULL,
    `archived` BOOLEAN NULL,
    `archivedAt` VARCHAR(191) NULL,
    `archivedTimestamp` VARCHAR(191) NULL,
    `autoArchiveDuration` INTEGER NULL,
    `createdTimestamp` VARCHAR(191) NOT NULL,
    `editable` BOOLEAN NOT NULL,
    `invitable` BOOLEAN NULL,
    `joinable` BOOLEAN NOT NULL,
    `joined` BOOLEAN NOT NULL,
    `locked` BOOLEAN NOT NULL,
    `manageable` BOOLEAN NOT NULL,
    `memberCount` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `unarchivable` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ThreadChannels_threadId_key`(`threadId`),
    UNIQUE INDEX `ThreadChannels_guildId_key`(`guildId`),
    INDEX `ThreadChannels_ownerId_idx`(`ownerId`),
    INDEX `ThreadChannels_guildId_idx`(`guildId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChannelMessages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `messageId` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `channelName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ChannelMessages_messageId_idx`(`messageId`),
    INDEX `ChannelMessages_channelId_idx`(`channelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserChannels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserChannels_accountId_idx`(`accountId`),
    INDEX `UserChannels_channelId_idx`(`channelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `Channels`(`channelId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Messages` ADD CONSTRAINT `Messages_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Users`(`accountId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Infractions` ADD CONSTRAINT `Infractions_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Infractions` ADD CONSTRAINT `Infractions_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Users`(`accountId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Moderators` ADD CONSTRAINT `Moderators_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Moderators` ADD CONSTRAINT `Moderators_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Users`(`accountId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuildSettings` ADD CONSTRAINT `GuildSettings_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuildMembers` ADD CONSTRAINT `GuildMembers_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuildMembers` ADD CONSTRAINT `GuildMembers_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Users`(`accountId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuildLogs` ADD CONSTRAINT `GuildLogs_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuildChannels` ADD CONSTRAINT `GuildChannels_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuildChannels` ADD CONSTRAINT `GuildChannels_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `Channels`(`channelId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ThreadChannels` ADD CONSTRAINT `ThreadChannels_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Users`(`accountId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ThreadChannels` ADD CONSTRAINT `ThreadChannels_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `Guilds`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChannelMessages` ADD CONSTRAINT `ChannelMessages_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Messages`(`messageId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChannelMessages` ADD CONSTRAINT `ChannelMessages_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `Channels`(`channelId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserChannels` ADD CONSTRAINT `UserChannels_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Users`(`accountId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserChannels` ADD CONSTRAINT `UserChannels_channelId_fkey` FOREIGN KEY (`channelId`) REFERENCES `Channels`(`channelId`) ON DELETE RESTRICT ON UPDATE CASCADE;
