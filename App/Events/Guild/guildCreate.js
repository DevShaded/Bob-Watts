'use strict';

const Guild = require("../../Discord/Guild");

module.exports = {
    name: 'guildCreate',
    once: false,
    execute: async (guild) => {
        if (guild.available) {
            try {
                const guildClass = new Guild(guild);
                await guildClass.getGuild();

                const guildId = process.env.APP_GUILD_ID;
                const channelId = process.env.APP_CHANNEL_ID;

                const messageGuild = guild.client.guilds.cache.get(guildId);
                const messageChannel = messageGuild.channels.cache.get(channelId);

                const embed = {
                    color:       '#28a745',
                    description: `I have joined **${guild.name}**`,
                    timestamp:   new Date(),
                    footer:      {
                        text: guild.client.user.username,
                    },
                };

                await messageChannel.send({ embeds: [embed] });
            } catch (e) {
                console.error('Oh no, something went wrong! Check the logs here->', e);
            }
        }

    },
};