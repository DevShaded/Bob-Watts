import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { httpTransport } from '../http.mjs';
import { imageUrl, record, httpStatus } from './information-response.mjs';
import { botUser } from './bot-user.mjs';

export const randomcat: Command = {
    category: 'Information',
    data: new SlashCommandBuilder().setName('randomcat').setDescription('Get a picture of a random cat!'),
    async execute(interaction, context) {
        let picture: string;
        try {
            const body = await (context.http ?? httpTransport).get('https://api.thecatapi.com/v1/images/search');
            const first: unknown = Array.isArray(body) ? body[0] : undefined;
            if (!record(first) || !imageUrl(first.url)) throw new Error('Invalid image response');
            picture = first.url;
        } catch (error) {
            await interaction.reply({ embeds: [{
                color: 0xff0000, title: 'Something wrong is going on!',
                description: httpStatus(error) ?? 'The image service is unavailable. Please try again later.',
                timestamp: new Date().toISOString(), footer: { text: botUser(interaction).username },
            }] });
            return;
        }
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(picture).setLabel('🖼️ Open Original Image'),
        );
        await interaction.reply({ embeds: [{
            color: 0x17a2b8, title: 'Here is a picture of a random cat!',
            image: { url: picture }, timestamp: new Date().toISOString(),
            footer: { text: botUser(interaction).username },
        }], components: [row] });
    },
};
