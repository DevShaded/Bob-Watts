'use strict';

const { MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const pm2 = require('pm2');
const moment = require('moment');

const data = new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Display information of the client/bot itself');

module.exports = {
    data:        data,
    name:        'botinfo',
    description: `Display information of the client/bot itself`,
    execute:     async (interaction) => {
        await pm2.describe('Bob Watts', (err, processDescriptionList) => {
            let pm_uptime = processDescriptionList[0]['pm2_env']['pm_uptime'];
            let restart_time = processDescriptionList[0]['pm2_env']['restart_time'];
            let version = processDescriptionList[0]['pm2_env']['version'];

            let now = moment.now();
            let seconds = moment(now).diff(moment(pm_uptime), 'seconds');

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

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setStyle('LINK')
                        .setURL('https://discord.gg/jfCv4XAfHA')
                        .setLabel('Support Server'),
                    new MessageButton()
                        .setStyle('LINK')
                        .setURL('https://github.com/DevShaded/BobWatts')
                        .setLabel('GitHub'),
                    new MessageButton()
                        .setStyle('LINK')
                        .setURL('https://top.gg/bot/661979662997782541')
                        .setLabel('TOP.GG'),
                );

            const serverOwnerEmoji = interaction.client.emojis.cache.get('952556627863683135');

            let clientCreated = interaction.guild.me.user.createdAt;
            clientCreated = moment(clientCreated).format('YYYY-MM-DD');

            const embed = {
                author:      {
                    name:     'Bot Information',
                    icon_url: `${interaction.guild.me.user.displayAvatarURL()}`,
                },
                color:       `#17a2b8`,
                title:       `${interaction.guild.me.user.username} Info`,
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
                        name:   `🔄 Restarts`,
                        value:  `\`\`\`${restart_time}\`\`\``,
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
                timestamp:   new Date(),
                footer:      {
                    text: interaction.client.user.username
                }
            };

            interaction.reply({ embeds: [embed], components: [row] });
        });
    },
};
