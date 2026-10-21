import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { executeModeration } from '../moderation.mjs';

const data = new SlashCommandBuilder()
    .setName('infractions')
    .setDescription('Get all infractions of the mentioned user in a server')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('Choose the user you want to get infractions from')
            .setRequired(true));

export const infractions: Command = {
    category: 'Moderation', data,
    execute: executeModeration,
};
