'use strict';

const GuildMember = require("../../Discord/GuildMember");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    name:    'guildMemberAdd',
    once:    false,
    execute: async (member) => {
        if (member.guild.available) {
            try {
                const guildClass = new GuildMember(member);
                await guildClass.getGuildMember();

                let welcomeMessage;
                welcomeMessage = await prisma.GuildLogs.findUnique({
                    where: {
                        guildId: member.guild.id
                    },

                    select: {
                        guildId:         true,
                        welcome_log:     true,
                        welcome_message: true,
                    },
                });

                let iGuild = await member.client.guilds.cache.get(`${welcomeMessage.guildId}`);
                let iChannel = await iGuild.channels.cache.get(`${welcomeMessage.welcome_log}`);

                if (!welcomeMessage.welcome_message) {
                    welcomeMessage = 'Joined the server';
                } else {
                    welcomeMessage = welcomeMessage.welcome_message
                }

                const embed = {
                    color:       '#28a745',
                    author:      {
                        name:     `${member.user.tag} (${member.user.id})`,
                        icon_url: member.user.displayAvatarURL(),
                    },
                    description: `${welcomeMessage}`,
                    timestamp:   new Date(),
                    footer:      {
                        text: 'Bob Watts',
                    }
                };

                await iChannel.send({ embeds: [embed] });

                const role = await prisma.GuildLogs.findUnique({
                    where: {
                        guildId: member.guild.id,
                    },

                    select: {
                        guildId: true,
                        join_role: true
                    },
                });

                let autorole = member.guild.roles.cache.get(role.join_role);

                if (!autorole) return;

                await member.roles.add(autorole);
            } catch (e) {
            }
        }
    },
};