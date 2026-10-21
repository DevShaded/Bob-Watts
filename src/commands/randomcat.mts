import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { record } from './information-response.mjs';
import { executeImageCommand } from './image-command.mjs';

export const randomcat: Command = {
    category: 'Information',
    data: new SlashCommandBuilder().setName('randomcat').setDescription('Get a picture of a random cat!'),
    execute(interaction, context) {
        return executeImageCommand(interaction, context, {
            url: 'https://api.thecatapi.com/v1/images/search',
            title: 'Here is a picture of a random cat!',
            errorColor: 0xff0000,
            readImage(body) {
                const first: unknown = Array.isArray(body) ? body[0] : undefined;
                return record(first) ? first.url : undefined;
            },
        });
    },
};
