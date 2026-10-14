'use strict';

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const { version } = require('../../package.json');
const moment = require('moment');

const data = new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Display information of the client/bot itself');

module.exports = {
    data:        data,
    name:        'botinfo',
    description: `Display information of the client/bot itself`,
    execute:     async (interaction) => {
        const seconds = Math.floor(process.uptime());

        function secondsToDHMS(seconds) {
            seconds = Number(seconds);
            let d = Math.floor(seconds / (3600 * 24));
            let h = Math.floor(seconds % (3600 * 24) / 3600);
            let m = Math.floor(seconds % 3600 / 60);
            let s = Math.floor(seconds % 60);

            let dDisplay = d > 0 ? d + (d === 1 ? "d, " : "d, ") : "";
            let hDisplay = h > 0 ? h + (h === 1 ? "h, " : "h, ") : "";
            let mDisplay = m > 0 ? m + (m === 1 ? "m, " : "m, ") : "";
            let sDisplay = s > 0 ? s + (s === 1 ? "s" : "s") : "";
            return dDisplay + hDisplay + mDisplay + sDisplay;
        }

        const row = new ActionRowBuilder()
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

        const serverOwnerEmoji = interaction.client.emojis.cache.get('952556627863683135');

        let clientCreated = interaction.client.user.createdAt;
        clientCreated = moment(clientCreated).format('YYYY-MM-DD');

        const embed = {
            author:      {
                name:     'Bot Information',
                icon_url: `${interaction.client.user.displayAvatarURL()}`,
            },
            color:       0x17a2b8,
            title:       `${interaction.client.user.username} Info`,
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
                    value:  `\`\`\`${(interaction.client.users.cache.size).toLocaleString()}\`\`\``,
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
                text: interaction.client.user.username
            }
        };

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
