import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { randomChoice } from './random-choice.mjs';

export const coinflip: Command = {
    category: 'Fun',
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flips a coin and return either Heads or Tails'),
    async execute(interaction) {
        // Pick a random coin
        const coin = randomChoice(['Heads', 'Tails']);
        await interaction.reply({ embeds: [{
            color: 0x17a2b8,
            description: `<:coin:620255307284742154> I flipped a coin and it landed on **${coin}**`,
        }] });
    },
};
