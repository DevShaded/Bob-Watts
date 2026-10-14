'use strict';

const { SlashCommandBuilder } = require('discord.js');

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
            embedColor = 0x28a745;
        } else if (interaction.client.ws.ping > 450 && interaction.client.ws.ping < 750) {
            embedColor = 0xFF6000;
        } else {
            embedColor = 0xdc3545;
        }

        const pingEmbed = {
            color:       embedColor,
            description: `🏓 Pong - ${Math.floor(interaction.client.ws.ping).toLocaleString()} milliseconds.`,
            timestamp:   new Date().toISOString(),
            footer:      {
                text:     interaction.client.user.username,
            }
        };

        await interaction.reply({ embeds: [pingEmbed] });
    },
};
