import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { executeModeration } from '../moderation.mjs';

const data = new SlashCommandBuilder()
    .setName('clean')
    .setDescription('Remove a certain amount of message from a user in the server')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('Choose the user you want to clean messages from your server')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('amount')
            .setDescription('Choose how many messages you want delete from that user')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('Specify a reason why you want to remove messages from this user'));

export const clean: Command = {
    category: 'Moderation', data,
    execute: executeModeration,
};
