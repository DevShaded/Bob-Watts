import { deleteModerator as executeDeleteModerator } from '../moderator.mjs';
import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';

const data = new SlashCommandBuilder()
    .setName('delete')
    .setDescription('This command is to set pre-defined settings')
    .addSubcommand(subcommand =>
        subcommand
            .setName('softmoderator')
            .setDescription('Delete a soft moderator from the servers moderation list')
            .addUserOption(option => option.setName('target').setDescription('Choose the user you want to delete').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('moderator')
            .setDescription('Delete a moderator from the servers moderation list')
            .addUserOption(option => option.setName('target').setDescription('Choose the user you want to delete').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('administrator')
            .setDescription('Delete a administrator from the servers moderation list')
            .addUserOption(option => option.setName('target').setDescription('Choose the user you want to delete').setRequired(true)));

export const deleteModerator: Command = {
    category: 'Settings', data,
    execute: executeDeleteModerator,
};
