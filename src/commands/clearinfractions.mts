import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { executeModeration } from '../moderation.mjs';

const data = new SlashCommandBuilder()
    .setName('clearinfractions')
    .setDescription('Clear a certain amount of infractions of the mentioned user in a server')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('Choose the user you want to clear infractions from your server')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('amount')
            .setDescription('Choose the amount of infractions you want to clear from this user')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('Specify a reason why you want to clear the infractions from this user'));

export const clearinfractions: Command = {
    category: 'Moderation', data,
    execute: executeModeration,
};
