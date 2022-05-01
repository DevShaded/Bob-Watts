'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');

/**
 * This class is based for maintaining Discord messages
 */
class Message {
    constructor(message) {
        this.message = message;
    }

    /**
     * This function we want to get User, Guild, Channel etc. information,
     * and store it in the database
     *
     * @returns {Promise<string>}
     */
    async getMessage() {
        // Try to get the user from the Database
        const getUser = await prisma.users.findUnique({
            where: {
                accountId: this.message.author.id,
            }
        });

        // If the user does not exist, we store the user in the database
        if (!getUser) {
            await this.createUser();
        } else {
            await this.updateUser();
        }

        // Try to get the Guild from the Database
        const getGuild = await prisma.guilds.findUnique({
            where: {
                guildId: this.message.guild.id,
            }
        });

        // Check if the guild is available from the Discord API
        if (this.message.guild.available) {
            // If the guild is not in the Database we store, if It's already there we try to update it with new info
            if (!getGuild) {
                await this.createGuild();
            } else {
                await this.updateGuild();
            }
        }

        // Try to get the Guild Member from the Database
        const getGuildMember = await prisma.GuildMembers.findUnique({
            where: {
                memberId: this.message.member.id
            }
        });

        if (!getGuildMember) {
            // If the Guild Member is not in the Database we store,
            // if It's already there we try to update it with new info
            await this.createGuildMember();
        } else {
            await this.updateGuildMember();
        }

        // Check if the channel is not a thread
        if (!this.message.channel.isThread()) {
            // Get the channel from the Database
            const getChannel = await prisma.Channels.findUnique({
                where: {
                    channelId: this.message.channel.id
                },
            });

            // If channel is not in Database we store it,
            // Otherwise we update it
            if (!getChannel) {
                await this.createChannel();
            } else {
                await this.updateChannel();
            }

            // Get the guild channel from the Database
            const getGuildChannel = await prisma.GuildChannels.findFirst({
                where: {
                    channelId: this.message.channel.id
                },
            });

            // If Guild Channel is not in Database we store it,
            // Otherwise we update it
            if (!getGuildChannel) {
                await this.createGuildChannel();
            } else {
                await this.updateGuildChannel();
            }
        } else {
            // Get the thread channel from the Database
            const getThreadChannel = await prisma.ThreadChannels.findUnique({
                where: {
                    threadId: this.message.channel.id
                }
            });

            // If Thread Channel is not in Database we store it,
            // Otherwise we update it
            if (!getThreadChannel) {
                await this.createThreadChannel();
            } else {
                await this.updateThreadChannel();
            }
        }

        const getMessage = await prisma.Messages.findFirst({
            where: {
                messageId: this.message.id
            }
        });

        if (!getMessage) {
            await this.createMessage();
        } else {
            await this.updateMessage();
        }

        return 'Message class has been called!';
    };

    /**
     * When the Discord User does not exist,
     * we store it here and return that the user has been created
     *
     * @returns {Promise<string>}
     */
    async createUser() {
        let createdTimestamp = this.message.author.createdTimestamp;
        createdTimestamp = moment(createdTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.users.create({
            data: {
                accountId:        this.message.author.id,
                username:         this.message.author.username,
                discriminator:    this.message.author.discriminator,
                avatar:           this.message.author.avatarURL({ dynamic: true }),
                bot:              this.message.author.bot,
                createdTimestamp: createdTimestamp
            }
        });

        return 'User has been created';
    }

    /**
     * If the Discord user is already stored in the DB,
     * we will update it here everytime the user sends a message
     * @returns {Promise<string>}
     */
    async updateUser() {
        let createdTimestamp = this.message.author.createdTimestamp;
        createdTimestamp = moment(createdTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.users.update({
            where: {
                accountId: this.message.author.id,
            },
            data:  {
                username:         this.message.author.username,
                discriminator:    this.message.author.discriminator,
                avatar:           this.message.author.avatarURL({ dynamic: true }),
                bot:              this.message.author.bot,
                createdTimestamp: createdTimestamp
            }
        });

        return 'User has been updated';
    }

    /**
     * Store the guild to the Database
     *
     * @returns {Promise<string>}
     */
    async createGuild() {
        let createdTimestamp = this.message.guild.createdTimestamp;
        createdTimestamp = moment(createdTimestamp).format('YYYY-MM-DD');

        let joinedTimestamp = this.message.guild.joinedTimestamp;
        joinedTimestamp = moment(joinedTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.Guilds.create({
            data: {
                guildId:                  this.message.guild.id,
                available:                this.message.guild.available,
                createdTimestamp:         createdTimestamp,
                joinedTimestamp:          joinedTimestamp,
                large:                    this.message.guild.large,
                maximumMembers:           this.message.guild.maximumMembers,
                maximumPresences:         this.message.guild.maximumPresences,
                memberCount:              this.message.guild.memberCount,
                partnered:                this.message.guild.partnered,
                premiumSubscriptionCount: this.message.guild.premiumSubscriptionCount,
                premiumTier:              this.message.guild.premiumTier,
                verified:                 this.message.guild.verified,

                GuildSettings: {
                    create: {
                        afkChannelID:                this.message.guild.afkChannelId,
                        afkTimeout:                  this.message.guild.afkTimeout,
                        bannerURL:                   this.message.guild.bannerURL({ dynamic: true }),
                        defaultMessageNotifications: this.message.guild.defaultMessageNotifications,
                        description:                 this.message.guild.description,
                        explicitContentFilter:       this.message.guild.explicitContentFilter,
                        iconURL:                     this.message.guild.iconURL({ dynamic: true }),
                        mfaLevel:                    this.message.guild.mfaLevel,
                        name:                        this.message.guild.name,
                        nameAcronym:                 this.message.guild.nameAcronym,
                        ownerID:                     this.message.guild.ownerId,
                        preferredLocale:             this.message.guild.preferredLocale,
                        rulesChannelID:              this.message.guild.rulesChannelId,
                        shardID:                     this.message.guild.shardId,
                        splashURL:                   this.message.guild.splashURL(),
                        systemChannelID:             this.message.guild.systemChannelId,
                        publicUpdatesChannelId:      this.message.guild.publicUpdatesChannelId,
                        vanityURLCode:               this.message.guild.vanityURLCode,
                        verificationLevel:           this.message.guild.verificationLevel
                    }
                }
            }
        });

        return 'Guild has been created';
    }

    /**
     * Update the already existing guild with new Information
     *
     * @returns {Promise<string>}
     */
    async updateGuild() {
        let createdTimestamp = this.message.guild.createdTimestamp;
        createdTimestamp = moment(createdTimestamp).format('YYYY-MM-DD');

        let joinedTimestamp = this.message.guild.joinedTimestamp;
        joinedTimestamp = moment(joinedTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.Guilds.update({
            where: {
                guildId: this.message.guild.id,
            },

            data: {
                available:                this.message.guild.available,
                createdTimestamp:         createdTimestamp,
                joinedTimestamp:          joinedTimestamp,
                large:                    this.message.guild.large,
                maximumMembers:           this.message.guild.maximumMembers,
                maximumPresences:         this.message.guild.maximumPresences,
                memberCount:              this.message.guild.memberCount,
                partnered:                this.message.guild.partnered,
                premiumSubscriptionCount: this.message.guild.premiumSubscriptionCount,
                premiumTier:              this.message.guild.premiumTier,
                verified:                 this.message.guild.verified,
            }
        });

        await prisma.GuildSettings.update({
            where: {
                guildId: this.message.guild.id,
            },

            data: {
                afkChannelID:                this.message.guild.afkChannelId,
                afkTimeout:                  this.message.guild.afkTimeout,
                bannerURL:                   this.message.guild.bannerURL(),
                defaultMessageNotifications: this.message.guild.defaultMessageNotifications,
                description:                 this.message.guild.description,
                explicitContentFilter:       this.message.guild.explicitContentFilter,
                iconURL:                     this.message.guild.iconURL(),
                mfaLevel:                    this.message.guild.mfaLevel,
                name:                        this.message.guild.name,
                nameAcronym:                 this.message.guild.nameAcronym,
                ownerID:                     this.message.guild.ownerId,
                preferredLocale:             this.message.guild.preferredLocale,
                rulesChannelID:              this.message.guild.rulesChannelId,
                shardID:                     this.message.guild.shardId,
                splashURL:                   this.message.guild.splashURL(),
                systemChannelID:             this.message.guild.systemChannelId,
                publicUpdatesChannelId:      this.message.guild.publicUpdatesChannelId,
                vanityURLCode:               this.message.guild.vanityURLCode,
                verificationLevel:           this.message.guild.verificationLevel,
            }
        });

        return 'Guild has been updated';
    }

    /**
     * Store the Guild Member in the database
     *
     * @returns {Promise<string>}
     */
    async createGuildMember() {
        let joinedTimestamp = this.message.member.joinedTimestamp;
        joinedTimestamp = moment(joinedTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.GuildMembers.create({
            data: {
                guildId:               this.message.guild.id,
                accountId:             this.message.author.id,
                memberId:              this.message.member.id,
                bannable:              this.message.member.bannable,
                displayColor:          this.message.member.displayColor,
                displayHexColor:       this.message.member.displayHexColor,
                displayName:           this.message.member.displayName,
                joinedTimestamp:       joinedTimestamp,
                kickable:              this.message.member.kickable,
                manageable:            this.message.member.manageable,
                nickname:              this.message.member.nickname,
                premiumSinceTimestamp: this.message.member.premiumSinceTimestamp
            }
        });

        return 'GuildMember has been created';
    }

    /**
     * Update the Guild Member with new info from the api
     *
     * @returns {Promise<string>}
     */
    async updateGuildMember() {
        let joinedTimestamp = this.message.member.joinedTimestamp;
        joinedTimestamp = moment(joinedTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.GuildMembers.update({
            where: {
                memberId: this.message.member.id
            },

            data: {
                bannable:              this.message.member.bannable,
                displayColor:          this.message.member.displayColor,
                displayHexColor:       this.message.member.displayHexColor,
                displayName:           this.message.member.displayName,
                joinedTimestamp:       joinedTimestamp,
                kickable:              this.message.member.kickable,
                manageable:            this.message.member.manageable,
                nickname:              this.message.member.nickname,
                premiumSinceTimestamp: this.message.member.premiumSinceTimestamp
            }
        });

        return 'GuildMember has been updated';
    }

    /**
     * Store the channel in the Database
     *
     * @returns {Promise<string>}
     */
    async createChannel() {
        let createdTimestamp = this.message.channel.createdTimestamp;
        createdTimestamp = moment(createdTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.channels.create({
            data: {
                channelId:        this.message.channel.id,
                name:             this.message.channel.name,
                nsfw:             this.message.channel.nsfw,
                topic:            this.message.channel.topic,
                type:             this.message.channel.type,
                createdTimestamp: createdTimestamp
            },
        });

        return 'Channel has been created';
    }

    /**
     * Update the channel with new information from the Discord API
     *
     * @returns {Promise<string>}
     */
    async updateChannel() {
        await prisma.channels.update({
            where: {
                channelId: this.message.channel.id,
            },
            data:  {
                name:  this.message.channel.name,
                nsfw:  this.message.channel.nsfw,
                topic: this.message.channel.topic,
                type:  this.message.channel.type,
            },
        });

        return 'Channel has been created';
    }

    /**
     * Store the Guild Channel in the Database
     *
     * @returns {Promise<string>}
     */
    async createGuildChannel() {
        await prisma.GuildChannels.create({
            data: {
                guildId:           this.message.guild.id,
                channelId:         this.message.channel.id,
                name:              this.message.channel.name,
                deletable:         this.message.channel.deletable,
                manageable:        this.message.channel.manageable,
                parentId:          this.message.channel.parentId,
                permissionsLocked: this.message.channel.permissionsLocked,
                position:          this.message.channel.position,
                rawPosition:       this.message.channel.rawPosition,
                viewable:          this.message.channel.viewable,
            }
        });

        return 'Guild Channel has been created';
    }

    /**
     * Update the Guild Channel with new information from the Discord API
     *
     * @returns {Promise<string>}
     */
    async updateGuildChannel() {
        await prisma.GuildChannels.update({
            where: {
                channelId: this.message.channel.id
            },

            data: {
                name:              this.message.channel.name,
                deletable:         this.message.channel.deletable,
                manageable:        this.message.channel.manageable,
                parentId:          this.message.channel.parentId,
                permissionsLocked: this.message.channel.permissionsLocked,
                position:          this.message.channel.position,
                rawPosition:       this.message.channel.rawPosition,
                viewable:          this.message.channel.viewable,
            }
        });

        return 'Guild Channel has been updated';
    }

    /**
     * Store the Thread Channel in the Database
     *
     * @returns {Promise<string>}
     */
    async createThreadChannel() {
        let createdTimestamp = this.message.channel.createdTimestamp;
        createdTimestamp = moment(createdTimestamp).format('YYYY-MM-DD HH-mm-ss');

        let archiveTimestamp = this.message.channel.archiveTimestamp;
        archiveTimestamp = moment(archiveTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.ThreadChannels.create({
            data: {
                threadId:            this.message.channel.id,
                ownerId:             this.message.channel.ownerId,
                guildId:             this.message.guild.id,
                threadName:          this.message.channel.name,
                archived:            this.message.channel.archived,
                archivedAt:          this.message.channel.archivedAt,
                archivedTimestamp:   archiveTimestamp,
                autoArchiveDuration: this.message.channel.autoArchiveDuration,
                createdTimestamp:    createdTimestamp,
                editable:            this.message.channel.editable,
                invitable:           this.message.channel.invitable,
                joinable:            this.message.channel.joinable,
                joined:              this.message.channel.joined,
                locked:              this.message.channel.locked,
                manageable:          this.message.channel.manageable,
                memberCount:         this.message.channel.memberCount,
                type:                this.message.channel.type,
                unarchivable:        this.message.channel.unarchivable,
            }
        });

        return 'Thread Channel has been created';
    }

    /**
     * Update the Thread with new information from Discord
     *
     * @returns {Promise<string>}
     */
    async updateThreadChannel() {
        let archiveTimestamp = this.message.channel.archiveTimestamp;
        archiveTimestamp = moment(archiveTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.ThreadChannels.update({
            where: {
                threadId: this.message.channel.id,
            },

            data: {
                threadName:          this.message.channel.name,
                archived:            this.message.channel.archived,
                archivedAt:          this.message.channel.archivedAt,
                archivedTimestamp:   archiveTimestamp,
                autoArchiveDuration: this.message.channel.autoArchiveDuration,
                editable:            this.message.channel.editable,
                invitable:           this.message.channel.invitable,
                joinable:            this.message.channel.joinable,
                joined:              this.message.channel.joined,
                locked:              this.message.channel.locked,
                manageable:          this.message.channel.manageable,
                memberCount:         this.message.channel.memberCount,
                type:                this.message.channel.type,
                unarchivable:        this.message.channel.unarchivable,
            }
        });

        return 'Thread Channel has been updated';
    }

    async createMessage() {
        await prisma.Messages.create({
            data: {
                messageId: this.message.id,
                guildId:   this.message.guild.id,
                channelId: this.message.channel.id,
                accountId: this.message.author.id,
                content:   this.message.content,
                url:       this.message.url,
            },
        });

        await prisma.ChannelMessages.create({
            data: {
                messageId:   this.message.id,
                channelId:   this.message.channel.id,
                channelName: this.message.channel.name
            }
        });

        await prisma.UserChannels.create({
            data: {
                accountId: this.message.author.id,
                channelId: this.message.channel.id,
            }
        });

    }

    async updateMessage() {

    }
}

module.exports = Message;
