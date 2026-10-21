import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { executeModeration } from '../moderation.mjs';

const data = new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute a member from your server')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('Choose the user you want to mute in your server')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('days')
            .setDescription('How many days do you want to mute this user for?'))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('Specify a reason why you want to mute this user'));

export const mute: Command = {
    category: 'Moderation', data,
    execute: executeModeration,
};
