import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { executeModeration } from '../moderation.mjs';

const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from your server')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('Choose the user you want to ban from your server')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('days')
            .setDescription('Delete message history')
            .addChoices({
                    "name":  '0 Days',
                    "value": 0
                },
                {
                    "name":  '1 Days',
                    "value": 1
                },
                {
					"name":  '2 Days',
                    "value": 2
                },
                {
                    "name":  '3 Days',
                    "value": 3
                },
                {
                    "name":  '4 Days',
                    "value": 4
                },
                {
                    "name":  '5 Days',
                    "value": 5
                },
                {
                    "name":  '6 Days',
                    "value": 6
                },
                {
                    "name":  '7 Days',
                    "value": 7
                })
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('Specify a reason why you want to ban this user'));

export const ban: Command = {
    category: 'Moderation', data,
    execute: executeModeration,
};
