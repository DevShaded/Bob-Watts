import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';

export const ping: Command = {
    category: 'Public',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Returns a message with a response time message'),
    async execute(interaction) {
        const { ping: latency } = interaction.client.ws;
        const hasLatency = Number.isFinite(latency) && latency >= 0;
        const user = interaction.client.user;
        if (!user) throw new Error('Discord client is not ready.');

        let color;
        if (!hasLatency) color = 0xffc107;
        else if (latency <= 450) color = 0x28a745;
        else if (latency < 750) color = 0xFF6000;
        else color = 0xdc3545;

        await interaction.reply({ embeds: [{
            color,
            description: hasLatency
                ? `🏓 Pong - ${Math.floor(latency).toLocaleString()} milliseconds.`
                : '🏓 Pong - gateway latency is not available yet.',
            timestamp: new Date().toISOString(),
            footer: { text: user.username },
        }] });
    },
};
