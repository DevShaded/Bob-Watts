import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { httpTransport } from '../http.mjs';
import { imageUrl, record, httpStatus } from './information-response.mjs';
import { botUser } from './bot-user.mjs';

export const randomdog: Command = {
    category: 'Information',
    data: new SlashCommandBuilder().setName('randomdog').setDescription('Get a picture of a random dog!'),
    async execute(interaction, context) {
        let picture: string;
        try {
            const body = await (context.http ?? httpTransport).get('https://dog.ceo/api/breeds/image/random');
            const first: unknown = body;
            if (!record(first) || !imageUrl(first.message)) throw new Error('Invalid image response');
            picture = first.message;
        } catch (error) {
            await interaction.reply({ embeds: [{
                color: 0x17a2b8, title: 'Something wrong is going on!',
                description: httpStatus(error) ?? 'The image service is unavailable. Please try again later.',
                timestamp: new Date().toISOString(), footer: { text: botUser(interaction).username },
            }] });
            return;
        }
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(picture).setLabel('🖼️ Open Original Image'),
        );
        await interaction.reply({ embeds: [{
            color: 0x17a2b8, title: 'Here is a picture of a random dog!',
            image: { url: picture }, timestamp: new Date().toISOString(),
            footer: { text: botUser(interaction).username },
        }], components: [row] });
    },
};
