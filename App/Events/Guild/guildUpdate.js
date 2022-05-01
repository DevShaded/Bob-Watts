'use strict';

const Guild = require("../../Discord/Guild");

module.exports = {
    name:    'guildUpdate',
    once:    false,
    execute: async (oldGuild, newGuild) => {
        if (oldGuild.available) {
            try {
                const guildClass = new Guild(newGuild);
                await guildClass.updateGuild();

                const guildId = process.env.APP_GUILD_ID;
                const channelId = process.env.APP_CHANNEL_ID;

                const messageGuild = newGuild.client.guilds.cache.get(guildId);
                const messageChannel = messageGuild.channels.cache.get(channelId);

                const embed = {
                    color:       '#28a745',
                    description: `Somebody has updated **${oldGuild.name}** new name **${newGuild.name}**`,
                    timestamp:   new Date(),
                    footer:      {
                        text: newGuild.client.user.username,
                    },
                };

                await messageChannel.send({ embeds: [embed] });
            } catch (e) {
                console.error('Oh no, something went wrong! Check the logs here->', e);
            }
        }

    },
};