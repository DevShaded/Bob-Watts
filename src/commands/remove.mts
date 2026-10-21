import { removeSetting } from '../settings.mjs';
import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';

const data = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('This command is to set pre-defined settings')
    .addSubcommand(subcommand =>
        subcommand
            .setName('joinchannel')
            .setDescription('Remove the custom join log channel for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('leavechannel')
            .setDescription('Remove the custom leave log channel for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('editchannel')
            .setDescription('Remove the custom edit log channel for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('deletechannel')
            .setDescription('Remove the custom delete log channel for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('infractionchannel')
            .setDescription('Remove the custom infraction log channel for moderation'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('muterole')
            .setDescription('Remove the custom mute role for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('autorole')
            .setDescription('Remove the custom auto role for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('welcomemessage')
            .setDescription('Remove the custom welcome message for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('goodbyemessage')
            .setDescription('Remove the custom goodbye message for this server'));

export const removeSettings: Command = {
    category: 'Settings', data,
    execute: removeSetting,
};
