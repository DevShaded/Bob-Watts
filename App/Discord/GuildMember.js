'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');

class GuildMember {
    constructor(member) {
        this.member = member
    }

    async getGuildMember() {
        const getMember = await prisma.users.findUnique({
            where: {
                accountId: this.member.user.id,
            },
        });

        if (!getMember) {
            await this.createGuildMember();
        } else {
            await this.updateGuildMember();
        }
    };

    async createGuildMember() {
        let createdTimestamp = this.member.user.createdTimestamp;
        createdTimestamp = moment(createdTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.users.create({
            data: {
                accountId:        this.member.user.id,
                username:         this.member.user.username,
                discriminator:    this.member.user.discriminator,
                avatar:           this.member.user.avatarURL({ dynamic: true }),
                bot:              this.member.user.bot,
                createdTimestamp: createdTimestamp
            }
        });

        await prisma.Guilds.update({
            where: {
                guildId: this.member.guild.id,
            },

            data: {
                memberCount: this.member.guild.memberCount
            }
        });

        return 'User has been created';
    };

    async updateGuildMember() {
        let createdTimestamp = this.member.user.createdTimestamp;
        createdTimestamp = moment(createdTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.users.update({
            where: {
                accountId: this.member.user.id,
            },

            data: {
                accountId:        this.member.user.id,
                username:         this.member.user.username,
                discriminator:    this.member.user.discriminator,
                avatar:           this.member.user.avatarURL({ dynamic: true }),
                bot:              this.member.user.bot,
                createdTimestamp: createdTimestamp,
            },
        });

        return 'User has been created';
    };

    async deleteGuildMember() {
        // Update the member count when a user leaves the guild
        await prisma.Guilds.update({
            where: {
                guildId: this.member.guild.id,
            },

            data: {
                memberCount: this.member.guild.memberCount
            }
        });

        return 'User has been deleted';
    };
}

module.exports = GuildMember;