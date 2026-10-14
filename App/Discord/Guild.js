'use strict';

const prisma = require('../Database');
require('dotenv').config({ quiet: true });
const moment = require('moment');
const databaseEnums = require('./databaseEnums');

class Guild {
    constructor(guild) {
        this.guild = guild;
    };

    async getGuild() {
        const getGuild = await prisma.guilds.findUnique({
            where: {
                guildId: this.guild.id
            }
        });

        if (!getGuild) {
            await this.createGuild();
        } else {
            await this.updateGuild();
        }
    }

    async createGuild() {
        let createdTimestamp = this.guild.createdTimestamp;
        createdTimestamp = moment(createdTimestamp).format('YYYY-MM-DD');

        let joinedTimestamp = this.guild.joinedTimestamp;
        joinedTimestamp = moment(joinedTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.guilds.create({
            data: {
                guildId:                  this.guild.id,
                available:                this.guild.available,
                createdTimestamp:         createdTimestamp,
                joinedTimestamp:          joinedTimestamp,
                large:                    this.guild.large,
                maximumMembers:           this.guild.maximumMembers,
                maximumPresences:         this.guild.maximumPresences,
                memberCount:              this.guild.memberCount,
                partnered:                this.guild.partnered,
                premiumSubscriptionCount: this.guild.premiumSubscriptionCount,
                premiumTier:              databaseEnums.premiumTier[this.guild.premiumTier],
                verified:                 this.guild.verified,

                GuildSettings: {
                    create: {
                        afkChannelID:                this.guild.afkChannelId,
                        afkTimeout:                  this.guild.afkTimeout,
                        bannerURL:                   this.guild.bannerURL({ forceStatic: false }),
                        defaultMessageNotifications: databaseEnums.defaultMessageNotifications[this.guild.defaultMessageNotifications],
                        description:                 this.guild.description,
                        explicitContentFilter:       databaseEnums.explicitContentFilter[this.guild.explicitContentFilter],
                        iconURL:                     this.guild.iconURL({ forceStatic: false }),
                        mfaLevel:                    databaseEnums.mfaLevel[this.guild.mfaLevel],
                        name:                        this.guild.name,
                        nameAcronym:                 this.guild.nameAcronym,
                        ownerID:                     this.guild.ownerId,
                        preferredLocale:             this.guild.preferredLocale,
                        rulesChannelID:              this.guild.rulesChannelId,
                        shardID:                     this.guild.shardId,
                        splashURL:                   this.guild.splashURL(),
                        systemChannelID:             this.guild.systemChannelId,
                        publicUpdatesChannelId:      this.guild.publicUpdatesChannelId,
                        vanityURLCode:               this.guild.vanityURLCode,
                        verificationLevel:           databaseEnums.verificationLevel[this.guild.verificationLevel]
                    }
                }
            }
        });

        return 'Guild has been created';
    }

    async updateGuild() {
        let createdTimestamp = this.guild.createdTimestamp;
        createdTimestamp = moment(createdTimestamp).format('YYYY-MM-DD');

        let joinedTimestamp = this.guild.joinedTimestamp;
        joinedTimestamp = moment(joinedTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.guilds.update({
            where: {
                guildId: this.guild.id,
            },

            data: {
                available:                this.guild.available,
                createdTimestamp:         createdTimestamp,
                joinedTimestamp:          joinedTimestamp,
                large:                    this.guild.large,
                maximumMembers:           this.guild.maximumMembers,
                maximumPresences:         this.guild.maximumPresences,
                memberCount:              this.guild.memberCount,
                partnered:                this.guild.partnered,
                premiumSubscriptionCount: this.guild.premiumSubscriptionCount,
                premiumTier:              databaseEnums.premiumTier[this.guild.premiumTier],
                verified:                 this.guild.verified,
            }
        });


        await prisma.guildSettings.update({
            where: {
                guildId: this.guild.id,
            },

            data: {
                afkChannelID:                this.guild.afkChannelId,
                afkTimeout:                  this.guild.afkTimeout,
                bannerURL:                   this.guild.bannerURL(),
                defaultMessageNotifications: databaseEnums.defaultMessageNotifications[this.guild.defaultMessageNotifications],
                description:                 this.guild.description,
                explicitContentFilter:       databaseEnums.explicitContentFilter[this.guild.explicitContentFilter],
                iconURL:                     this.guild.iconURL(),
                mfaLevel:                    databaseEnums.mfaLevel[this.guild.mfaLevel],
                name:                        this.guild.name,
                nameAcronym:                 this.guild.nameAcronym,
                ownerID:                     this.guild.ownerId,
                preferredLocale:             this.guild.preferredLocale,
                rulesChannelID:              this.guild.rulesChannelId,
                shardID:                     this.guild.shardId,
                splashURL:                   this.guild.splashURL(),
                systemChannelID:             this.guild.systemChannelId,
                publicUpdatesChannelId:      this.guild.publicUpdatesChannelId,
                vanityURLCode:               this.guild.vanityURLCode,
                verificationLevel:           databaseEnums.verificationLevel[this.guild.verificationLevel],
            }
        });

        return 'Guild has been updated';
    }

    async unavailableGuild() {
        await prisma.guilds.update({
            where: {
                guildId: this.guild.id,
            },

            data: {
                available: this.guild.available,
            },
        });
    }
}

module.exports = Guild;
