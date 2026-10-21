import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { randomChoice } from './random-choice.mjs';

export const diceroll: Command = {
    category: 'Fun',
    data: new SlashCommandBuilder()
        .setName('diceroll')
        .setDescription('Dice roll, returns a number between 1 and 6'),
    async execute(interaction) {
        const answer = randomChoice(['1', '2', '3', '4', '5', '6']);
        await interaction.reply({ embeds: [{
            color: 0x17a2b8,
            description: `🎲 I threw a dice and it turned out to be **${answer}**`,
        }] });
    },
};
