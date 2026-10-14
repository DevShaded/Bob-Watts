import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import moment from 'moment';
import packageMetadata from '../../package.json' with { type: 'json' };
import type { Command } from '../contracts.mjs';
import { botUser } from './bot-user.mjs';

const { version } = packageMetadata;

function secondsToDHMS(seconds: number): string {
    const units: readonly [number, string][] = [
        [Math.floor(seconds / 86400), 'd, '],
        [Math.floor(seconds % 86400 / 3600), 'h, '],
        [Math.floor(seconds % 3600 / 60), 'm, '],
        [Math.floor(seconds % 60), 's'],
    ];
    return units.map(([value, unit]) => value > 0 ? `${value.toString()}${unit}` : '').join('');
}

export const botinfo: Command = {
    category: 'Public',
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Display information of the client/bot itself'),
    async execute(interaction) {
        const user = botUser(interaction);
        const seconds = Math.floor(process.uptime());
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/jfCv4XAfHA')
                    .setLabel('Support Server'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://github.com/DevShaded/Bob-Watts')
                    .setLabel('GitHub'),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://top.gg/bot/661979662997782541')
                    .setLabel('TOP.GG'),
            );

        const serverOwnerEmoji = interaction.client.emojis.cache.get('952556627863683135')?.toString() ?? '👑';

        const clientCreated = moment(user.createdAt).format('YYYY-MM-DD');

        const embed = {
            author:      {
                name:     'Bot Information',
                icon_url: user.displayAvatarURL(),
            },
            color:       0x17a2b8,
            title:       `${user.username} Info`,
            description: `Bob Watts is a multipurpose bot that does many things, from Fun and Informative commands to Moderation and Logging commands!\n\nBob Watts can be customized with many things like, custom Welcome/Goodbye messages, and moderation logging etc.`,
            fields:      [
                {
                    name:   `${serverOwnerEmoji} Founder`,
                    value:  `\`\`\`DevShaded#1435\`\`\``,
                    inline: false,
                },
                {
                    name:   `📦 Library`,
                    value:  `\`\`\`Discord.js\`\`\``,
                    inline: true,
                },
                {
                    name:   `📊 Server Count`,
                    value:  `\`\`\`${(interaction.client.guilds.cache.size).toLocaleString()}\`\`\``,
                    inline: true,
                },
                {
                    name:   `📊 Member Served`,
                    value:  `\`\`\`${interaction.client.users.cache.size.toLocaleString()}\`\`\``,
                    inline: true,
                },
                {
                    name:   `▶️ Bot Version`,
                    value:  `\`\`\`${version}\`\`\``,
                    inline: true,
                },
                {
                    name:   `🏓 Latency`,
                    value:  `\`\`\`${Math.floor(interaction.client.ws.ping).toLocaleString()} milliseconds\`\`\``,
                    inline: true,
                },
                {
                    name:   `🌍 Region`,
                    value:  `\`\`\`London, UK\`\`\``,
                    inline: true,
                },
                {
                    name:   `🤖 Bot Creation`,
                    value:  `\`\`\`${clientCreated}\`\`\``,
                    inline: true,
                },
                {
                    name:   `⏱️ Uptime`,
                    value:  `\`\`\`${secondsToDHMS(seconds)}\`\`\``,
                    inline: true,
                },
            ],
            timestamp:   new Date().toISOString(),
            footer:      {
                text: user.username
            }
        };

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
