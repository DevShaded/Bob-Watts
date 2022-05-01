'use strict';

module.exports = {
    name:    'guildDelete',
    once:    false,
    execute: async (guild) => {
        try {
            const guildId = process.env.APP_GUILD_ID;
            const channelId = process.env.APP_CHANNEL_ID;

            const messageGuild = guild.client.guilds.cache.get(guildId);
            const messageChannel = messageGuild.channels.cache.get(channelId);

            const embed = {
                color:       '#dc3545',
                description: `I have left **${guild.name}**`,
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
