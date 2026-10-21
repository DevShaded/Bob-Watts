import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { executeModeration } from '../moderation.mjs';

const data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick the mentioned user from the server')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('Choose the user you want to kick from your server')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('Specify a reason why you want to kick this user'));

export const kick: Command = {
    category: 'Moderation', data,
    execute: executeModeration,
};
