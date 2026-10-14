import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { replyWithUserAction } from './user-action.mjs';

export const slap: Command = {
    category: 'Fun',
    data: new SlashCommandBuilder()
        .setName('slap')
        .setDescription('Hug the mentioned user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Mention the user who you want to slap')
                .setRequired(true)),
    async execute(interaction) {
        await replyWithUserAction(interaction, userId => `👏 <@${interaction.user.id}> slapped <@${userId}> hardly`);
    },
};
