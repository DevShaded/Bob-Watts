'use strict';

const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Returns a message with a response time message');

module.exports = {
    data:        data,
    name:        'ping',
    description: 'Returns a message with a response time message',
    execute:     async (interaction) => {
        let embedColor;

        if (interaction.client.ws.ping <= 450) {
            embedColor = '#28a745';
        } else if (interaction.client.ws.ping > 450 && interaction.client.ws.ping < 750) {
            embedColor = '#FF6000';
        } else {
            embedColor = '#dc3545';
        }

        const pingEmbed = {
            color:       embedColor,
            description: `🏓 Pong - ${Math.floor(interaction.client.ws.ping).toLocaleString()} milliseconds.`,
            timestamp:   new Date(),
            footer:      {
                text:     interaction.client.user.username,
                icon_url: '',
            }
        };

        await interaction.reply({ embeds: [pingEmbed] });
    },
};
