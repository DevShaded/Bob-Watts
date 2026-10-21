import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { executeModeration } from '../moderation.mjs';

const data = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member from your server')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('Choose the user you want to warn from your server')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('Specify a reason why you want to warn this user'));

export const warn: Command = {
    category: 'Moderation', data,
    execute: executeModeration,
};
