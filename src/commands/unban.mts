import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { executeModeration } from '../moderation.mjs';

const data = new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user that has been banned from your server')
    .addStringOption(option =>
        option.setName('target')
            .setDescription('Enter the UserID from the user that was banned')
            .setRequired(true));

export const unban: Command = {
    category: 'Moderation', data,
    execute: executeModeration,
};
