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
        const latency = interaction.client.ws.ping;
        const hasLatency = Number.isFinite(latency) && latency >= 0;
        let embedColor;

        if (!hasLatency) {
            embedColor = 0xffc107;
        } else if (latency <= 450) {
            embedColor = 0x28a745;
        } else if (latency < 750) {
            embedColor = 0xFF6000;
        } else {
            embedColor = 0xdc3545;
        }

        const pingEmbed = {
            color:       embedColor,
            description: hasLatency
                ? `🏓 Pong - ${Math.floor(latency).toLocaleString()} milliseconds.`
                : '🏓 Pong - gateway latency is not available yet.',
            timestamp:   new Date().toISOString(),
            footer:      {
                text:     interaction.client.user.username,
            }
        };

        await interaction.reply({ embeds: [pingEmbed] });
    },
};
