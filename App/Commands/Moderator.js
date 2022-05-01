'use strict';

const { PrismaClient } = require('@prisma/client');
const moment = require("moment");
const prisma = new PrismaClient();

class Moderator {
    constructor(interaction) {
        this.interaction = interaction;
    }

    /**
     * Store the soft moderator to the database
     * @returns {Promise<*>}
     */
    async addSoftModerator() {
        let target = this.interaction.options.getUser('target');

        if (!target) return this.interaction.reply({
            content: 'Sorry, I can\'t find this user!',
            ephemeral: true
        });

        const user = await prisma.users.findUnique({
            where: {
                accountId: target.id,
            }
        });

        const userGuild = await prisma.guilds.findUnique({
            where: {
                guildId: this.interaction.guild.id
            }
        });

        if (!user) await this.createUser(target);
        if (!userGuild) await this.createGuild();

        const userModerator = await prisma.Moderators.findFirst({
            where: {
                guildId: this.interaction.guild.id,
                accountId: target.id
            },

            include: {
                guild: true,
            }
        });

        if (!userModerator) {
            console.log(target.id)

            await prisma.Moderators.create({
                data: {
                    guildId: this.interaction.guild.id,
                    accountId: target.id,
                    level: 3,
                }
            });

            const creatModerator = {
                color: '#28a745',
                description: `<@${target.id}> is now a soft moderator of this server!`,
                timestamp: new Date(),
                footer: {
                    text: this.interaction.client.user.username
                }
            };

            await this.interaction.reply({ embeds: [creatModerator], ephemeral: true });

            try {
                const muteDMEmbed = {
                    color:       '#ffc107',
                    description: `You are now soft moderator in **${this.interaction.guild.name}** \n\n You can now use moderation commands like \`/warn\``,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                }

                await target.send({ embeds: [muteDMEmbed] })
            } catch (e) {
                console.log(`Failed to DM ${target.tag}`, e)
            }
        } else {
            console.log(userModerator)

            await prisma.Moderators.deleteMany({
                where: {
                    guildId: this.interaction.guild.id,
                    accountId: target.id
                }
            });

            await prisma.Moderators.create({
                data: {
                    guildId: this.interaction.guild.id,
                    accountId: target.id,
                    level: 3,
                }
            });

            const alreadyModerator = {
                color: '#28a745',
                description: `<@${target.id}> has now been updated to soft moderator of this server!`,
                timestamp: new Date(),
                footer: {
                    text: this.interaction.client.user.username
                }
            };

            await this.interaction.reply({ embeds: [alreadyModerator], ephemeral: true });

            try {
                const muteDMEmbed = {
                    color:       '#ffc107',
                    description: `You have been updated to soft moderator in **${this.interaction.guild.name}** \n\n You can now use moderation commands like \`/warn\``,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                }

                await target.send({ embeds: [muteDMEmbed] })
            } catch (e) {
                console.log(`Failed to DM ${target.tag}`, e)
            }
        }
    };

    /**
     * Store the moderator in the database
     * @returns {Promise<*>}
     */
    async addModerator() {
        let target = this.interaction.options.getUser('target');

        if (!target) return this.interaction.reply({
            content: 'Sorry, I can\'t find this user!',
            ephemeral: true
        });

        const user = await prisma.users.findUnique({
            where: {
                accountId: target.id,
            }
        });

        const userGuild = await prisma.guilds.findUnique({
            where: {
                guildId: this.interaction.guild.id
            }
        });

        if (!user) await this.createUser(target);
        if (!userGuild) await this.createGuild();

        const userModerator = await prisma.Moderators.findFirst({
            where: {
                guildId: this.interaction.guild.id,
                accountId: target.id
            },

            include: {
                guild: true,
            }
        });

        if (!userModerator) {
            console.log(target.id)

            await prisma.Moderators.create({
                data: {
                    guildId: this.interaction.guild.id,
                    accountId: target.id,
                    level: 2,
                }
            });

            const creatModerator = {
                color: '#28a745',
                description: `<@${target.id}> is now a moderator of this server!`,
                timestamp: new Date(),
                footer: {
                    text: this.interaction.client.user.username
                }
            };

            await this.interaction.reply({ embeds: [creatModerator], ephemeral: true });

            try {
                const muteDMEmbed = {
                    color:       '#ffc107',
                    description: `You are now moderator in **${this.interaction.guild.name}** \n\n You can now use moderation commands like \`/ban\`,  \`/clean\`, \`/kick\`, \`/mute\`, \`/unban\`, \`/unmute\`, \`/warn\``,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                }

                await target.send({ embeds: [muteDMEmbed] })
            } catch (e) {
                console.log(`Failed to DM ${target.tag}`, e)
            }
        } else {
            console.log(userModerator)

            await prisma.Moderators.deleteMany({
                where: {
                    guildId: this.interaction.guild.id,
                    accountId: target.id
                }
            });

            await prisma.Moderators.create({
                data: {
                    guildId: this.interaction.guild.id,
                    accountId: target.id,
                    level: 2,
                }
            });

            const alreadyModerator = {
                color: '#28a745',
                description: `<@${target.id}> has now been updated to moderator of this server!`,
                timestamp: new Date(),
                footer: {
                    text: this.interaction.client.user.username
                }
            };

            await this.interaction.reply({ embeds: [alreadyModerator], ephemeral: true });

            try {
                const muteDMEmbed = {
                    color:       '#ffc107',
                    description: `You have been updated to moderator in **${this.interaction.guild.name}** \n\n You can now use moderation commands like \`/ban\`,  \`/clean\`, \`/kick\`, \`/mute\`, \`/unban\`, \`/unmute\`, \`/warn\``,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                }

                await target.send({ embeds: [muteDMEmbed] })
            } catch (e) {
                console.log(`Failed to DM ${target.tag}`, e)
            }
        }
    };

    /**
     * Store the administrator in the database
     * @returns {Promise<void>}
     */
    async addAdministrator() {
        let target = this.interaction.options.getUser('target');

        if (!target) return this.interaction.reply({
            content: 'Sorry, I can\'t find this user!',
            ephemeral: true
        });

        const user = await prisma.users.findUnique({
            where: {
                accountId: target.id,
            }
        });

        const userGuild = await prisma.guilds.findUnique({
            where: {
                guildId: this.interaction.guild.id
            }
        });

        if (!user) await this.createUser(target);
        if (!userGuild) await this.createGuild();

        const userModerator = await prisma.Moderators.findFirst({
            where: {
                guildId: this.interaction.guild.id,
                accountId: target.id
            },

            include: {
                guild: true,
            }
        });

        if (!userModerator) {
            console.log(target.id)

            await prisma.Moderators.create({
                data: {
                    guildId: this.interaction.guild.id,
                    accountId: target.id,
                    level: 1,
                }
            });

            const creatModerator = {
                color: '#28a745',
                description: `<@${target.id}> is now an administrator of this server!`,
                timestamp: new Date(),
                footer: {
                    text: this.interaction.client.user.username
                }
            };

            await this.interaction.reply({ embeds: [creatModerator], ephemeral: true });

            try {
                const muteDMEmbed = {
                    color:       '#ffc107',
                    description: `You are now administrator in **${this.interaction.guild.name}** \n\n You can now use moderation commands like \`/ban\`,  \`/clean\`, \`/clearinfraction\`, \`/kick\`, \`/mute\`, \`/unban\`, \`/unmute\`, \`/warn\``,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                }

                await target.send({ embeds: [muteDMEmbed] })
            } catch (e) {
                console.log(`Failed to DM ${target.tag}`, e)
            }
        } else {
            console.log(userModerator)

            await prisma.Moderators.deleteMany({
                where: {
                    guildId: this.interaction.guild.id,
                    accountId: target.id
                }
            });

            await prisma.Moderators.create({
                data: {
                    guildId: this.interaction.guild.id,
                    accountId: target.id,
                    level: 1,
                }
            });

            const alreadyModerator = {
                color: '#28a745',
                description: `<@${target.id}> has now been updated to administrator of this server!`,
                timestamp: new Date(),
                footer: {
                    text: this.interaction.client.user.username
                }
            };

            await this.interaction.reply({ embeds: [alreadyModerator], ephemeral: true });

            try {
                const muteDMEmbed = {
                    color:       '#ffc107',
                    description: `You have been updated to administrator in **${this.interaction.guild.name}** \n\n You can now use moderation commands like \`/ban\`, \`/clean\`, \`/clearinfraction\`, \`/kick\`, \`/mute\`, \`/unban\`, \`/unmute\`, \`/warn\``,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                }

                await target.send({ embeds: [muteDMEmbed] })
            } catch (e) {
                console.log(`Failed to DM ${target.tag}`, e)
            }
        }
    };

    async createUser(target) {
        let createdTimestamp = target.createdTimestamp;
        createdTimestamp = moment(createdTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.users.create({
            data: {
                accountId:        target.id,
                username:         target.username,
                discriminator:    target.discriminator,
                avatar:           target.avatarURL({ dynamic: true }),
                bot:              target.bot,
                createdTimestamp: createdTimestamp
            }
        });
    };

    async createGuild() {
        let guildCreatedTimestamp = this.interaction.guild.createdTimestamp;
        guildCreatedTimestamp = moment(guildCreatedTimestamp).format('YYYY-MM-DD');

        let joinedTimestamp = this.interaction.guild.joinedTimestamp;
        joinedTimestamp = moment(joinedTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.Guilds.create({
            data: {
                guildId:                  this.interaction.guild.id,
                available:                this.interaction.guild.available,
                createdTimestamp:         guildCreatedTimestamp,
                joinedTimestamp:          joinedTimestamp,
                large:                    this.interaction.guild.large,
                maximumMembers:           this.interaction.guild.maximumMembers,
                maximumPresences:         this.interaction.guild.maximumPresences,
                memberCount:              this.interaction.guild.memberCount,
                partnered:                this.interaction.guild.partnered,
                premiumSubscriptionCount: this.interaction.guild.premiumSubscriptionCount,
                premiumTier:              this.interaction.guild.premiumTier,
                verified:                 this.interaction.guild.verified,

                GuildSettings: {
                    create: {
                        afkChannelID:                this.interaction.guild.afkChannelId,
                        afkTimeout:                  this.interaction.guild.afkTimeout,
                        bannerURL:                   this.interaction.guild.bannerURL({ dynamic: true }),
                        defaultMessageNotifications: this.interaction.guild.defaultMessageNotifications,
                        description:                 this.interaction.guild.description,
                        explicitContentFilter:       this.interaction.guild.explicitContentFilter,
                        iconURL:                     this.interaction.guild.iconURL({ dynamic: true }),
                        mfaLevel:                    this.interaction.guild.mfaLevel,
                        name:                        this.interaction.guild.name,
                        nameAcronym:                 this.interaction.guild.nameAcronym,
                        ownerID:                     this.interaction.guild.ownerId,
                        preferredLocale:             this.interaction.guild.preferredLocale,
                        rulesChannelID:              this.interaction.guild.rulesChannelId,
                        shardID:                     this.interaction.guild.shardId,
                        splashURL:                   this.interaction.guild.splashURL(),
                        systemChannelID:             this.interaction.guild.systemChannelId,
                        publicUpdatesChannelId:      this.interaction.guild.publicUpdatesChannelId,
                        vanityURLCode:               this.interaction.guild.vanityURLCode,
                        verificationLevel:           this.interaction.guild.verificationLevel
                    }
                }
            }
        });
    }
}

module.exports = Moderator;
