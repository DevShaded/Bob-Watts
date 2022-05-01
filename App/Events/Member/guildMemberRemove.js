'use strict';

const GuildMember = require("../../Discord/GuildMember");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    name:    'guildMemberRemove',
    once:    false,
    execute: async (member) => {
        if (member.guild.available) {
            try {
                const guildClass = new GuildMember(member);
                await guildClass.deleteGuildMember();

                let leaveMessage;
                leaveMessage = await prisma.GuildLogs.findUnique({
                    where: {
                        guildId: member.guild.id
                    },

                    select: {
                        guildId:         true,
                        goodbye_log:     true,
                        goodbye_message: true,
                    },
                });

                let iGuild = await member.client.guilds.cache.get(`${leaveMessage.guildId}`);
                let iChannel = await iGuild.channels.cache.get(`${leaveMessage.goodbye_log}`);

                if (!leaveMessage.goodbye_message) {
                    leaveMessage = 'Left the server';
                } else {
                    leaveMessage = leaveMessage.goodbye_message
                }

                const embed = {
                    color:       '#dc3545',
                    author:      {
                        name:     `${member.user.tag} (${member.user.id})`,
                        icon_url: member.user.displayAvatarURL(),
                    },
                    description: `${leaveMessage}`,
                    timestamp:   new Date(),
                    footer:      {
                        text: 'Bob Watts',
                    }
                };

                await iChannel.send({ embeds: [embed] });
            } catch {

            }
        }
    },
};