import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import { commandCategories } from '../contracts.mjs';
import type { Command, CommandCategory } from '../contracts.mjs';
import { botUser } from './bot-user.mjs';

const categoryLabels: Record<CommandCategory, string> = {
    Fun: '😀 Fun', Moderation: '🛡️ Moderation', Public: '👥 Public',
    Settings: '⚙️ Settings', Information: 'ℹ️ Information',
};

export const help: Command = {
    category: 'Public',
    data: new SlashCommandBuilder().setName('help')
        .setDescription('Returns a message with all of the commands available from the bot'),
    async execute(interaction, { commands }) {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/jfCv4XAfHA').setLabel('Support Server'),
        );
        const fields = commandCategories.map(category => ({
            name: categoryLabels[category],
            value: commands.filter(command => command.category === category)
                .map(command => command.data.toJSON().name).sort()
                .map(name => `\`/${name}\``).join('\n') || '\u200b',
            inline: true,
        }));
        fields.push({ name: 'Hope this helps!', value: 'I really hope it does', inline: true });
        await interaction.reply({ embeds: [{
            title: 'Bot Commands',
            color: 0x17a2b8,
            description: 'Here are all of the commands that are available from Bob Watts!',
            fields,
            timestamp: new Date().toISOString(),
            footer: { text: botUser(interaction).username },
        }], components: [row] });
    },
};
