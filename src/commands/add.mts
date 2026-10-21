import { addModerator as executeAddModerator } from '../moderator.mjs';
import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';

const data = new SlashCommandBuilder()
    .setName('add')
    .setDescription('This command is to set pre-defined settings')
    .addSubcommand(subcommand =>
        subcommand
            .setName('softmoderator')
            .setDescription('Add a soft moderator to the servers moderation list')
            .addUserOption(option => option.setName('target').setDescription('Choose the user you want to make soft moderator').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('moderator')
            .setDescription('Add a moderator to the servers moderation list')
            .addUserOption(option => option.setName('target').setDescription('Choose the user you want to make moderator').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('administrator')
            .setDescription('Add a administrator to the servers moderation list')
            .addUserOption(option => option.setName('target').setDescription('Choose the user you want to make administrator').setRequired(true)));

export const addModerator: Command = {
    category: 'Settings', data,
    execute: executeAddModerator,
};
