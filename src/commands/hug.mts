import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { replyWithUserAction } from './user-action.mjs';

export const hug: Command = {
    category: 'Fun',
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('Hug the mentioned user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Mention the user who you want to give a hug to')
                .setRequired(true)),
    async execute(interaction) {
        await replyWithUserAction(interaction, userId => `🤗 <@${interaction.user.id}> gave <@${userId}> a hug`);
    },
};
