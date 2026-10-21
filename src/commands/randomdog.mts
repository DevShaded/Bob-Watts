import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { record } from './information-response.mjs';
import { executeImageCommand } from './image-command.mjs';

export const randomdog: Command = {
    category: 'Information',
    data: new SlashCommandBuilder().setName('randomdog').setDescription('Get a picture of a random dog!'),
    execute(interaction, context) {
        return executeImageCommand(interaction, context, {
            url: 'https://dog.ceo/api/breeds/image/random',
            title: 'Here is a picture of a random dog!',
            errorColor: 0x17a2b8,
            readImage(body) {
                return record(body) ? body.message : undefined;
            },
        });
    },
};
