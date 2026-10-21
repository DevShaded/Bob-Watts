import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { replyWithUserAction } from './user-action.mjs';
import { randomChoice } from './random-choice.mjs';

export const kiss: Command = {
    category: 'Fun',
    data: new SlashCommandBuilder()
        .setName('kiss')
        .setDescription('Kiss the mentioned user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Mention the user who you want to give a kiss to')
                .setRequired(true)),
    async execute(interaction) {
        await replyWithUserAction(interaction, userId => `💋 <@${interaction.user.id}> kissed <@${userId}> ${randomChoice(['***fast***', '*cutely*', '**on the check**'])}`);
    },
};
