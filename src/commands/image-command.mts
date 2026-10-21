import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { CommandContext, CommandInteraction } from '../contracts.mjs';
import { httpTransport } from '../http.mjs';
import { imageUrl, httpStatus } from './information-response.mjs';
import { botUser } from './bot-user.mjs';

export async function executeImageCommand(interaction: CommandInteraction, context: CommandContext, options: {
    url: string;
    title: string;
    errorColor: number;
    readImage(body: unknown): unknown;
}): Promise<void> {
    let picture: string;
    try {
        const body = await (context.http ?? httpTransport).get(options.url);
        const image = options.readImage(body);
        if (!imageUrl(image)) throw new Error('Invalid image response');
        picture = image;
    } catch (error) {
        await interaction.reply({ embeds: [{
            color: options.errorColor, title: 'Something wrong is going on!',
            description: httpStatus(error) ?? 'The image service is unavailable. Please try again later.',
            timestamp: new Date().toISOString(), footer: { text: botUser(interaction).username },
        }] });
        return;
    }
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(picture).setLabel('🖼️ Open Original Image'),
    );
    await interaction.reply({ embeds: [{
        color: 0x17a2b8, title: options.title,
        image: { url: picture }, timestamp: new Date().toISOString(),
        footer: { text: botUser(interaction).username },
    }], components: [row] });
}
