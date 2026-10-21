import { executeSetting } from '../settings.mjs';
import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';

const data = new SlashCommandBuilder()
    .setName('set')
    .setDescription('This command is to set pre-defined settings')
    .addSubcommand(subcommand =>
        subcommand
            .setName('joinchannel')
            .setDescription('Set a custom join log channel for this server')
            .addChannelOption(option => option.setName('channel').setDescription('Here you can set the channel').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('leavechannel')
            .setDescription('Set a custom leave log channel for this server')
            .addChannelOption(option => option.setName('channel').setDescription('Here you can set the channel').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('editchannel')
            .setDescription('Set a custom edit log channel for this server')
            .addChannelOption(option => option.setName('channel').setDescription('Here you can set the channel').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('deletechannel')
            .setDescription('Set a custom delete log channel for this server')
            .addChannelOption(option => option.setName('channel').setDescription('Here you can set the channel').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('infractionchannel')
            .setDescription('Set a custom infraction log channel for moderation')
            .addChannelOption(option => option.setName('channel').setDescription('Here you can set the channel').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('muterole')
            .setDescription('Set a custom mute role for this server')
            .addRoleOption(option => option.setName('role').setDescription('Here you can set the custom role').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('autorole')
            .setDescription('Set a custom auto role for this server')
            .addRoleOption(option => option.setName('role').setDescription('Here you can set the custom role').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('welcomemessage')
            .setDescription('Set a custom welcome message for new members in this server')
            .addStringOption(option => option.setName('message').setDescription('Here you can set the custom message (Custom emojis WILL NOT WORK)').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('goodbyemessage')
            .setDescription('Set a custom goodbye message for new members in this server')
            .addStringOption(option => option.setName('message').setDescription('Here you can set the custom message (Custom emojis WILL NOT WORK)').setRequired(true)));

export const setSettings: Command = {
    category: 'Settings', data,
    execute: executeSetting,
};
