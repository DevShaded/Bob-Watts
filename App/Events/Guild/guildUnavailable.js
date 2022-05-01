'use strict';

const Guild = require("../../Discord/Guild");

module.exports = {
    name:    'guildUnavailable',
    once:    false,
    execute: async (guild) => {
        try {
            const guildClass = new Guild(guild);
            await guildClass.unavailableGuild();

            const guildId = process.env.APP_GUILD_ID;
            const channelId = process.env.APP_CHANNEL_ID;

            const messageGuild = guild.client.guilds.cache.get(guildId);
            const messageChannel = messageGuild.channels.cache.get(channelId);

            const embed = {
                color:       '#dc3545',
                description: `**${guild.name}** is now unavailable`,
                timestamp:   new Date(),
                footer:      {
                    text: guild.client.user.username,
                },
            };

            await messageChannel.send({ embeds: [embed] });
        } catch (e) {
            console.error('Oh no, something went wrong! Check the logs here->', e);
        }
    },
};