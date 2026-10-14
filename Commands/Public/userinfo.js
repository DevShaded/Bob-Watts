'use strict';

const moment = require("moment");
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Display information about the mentioned user in a server')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('Choose the user you want to get info about!')
            .setRequired(true));

module.exports = {
    data:        data,
    name:        'userinfo',
    description: 'Display information about the mentioned user in a server',
    execute:     async (interaction) => {
        const flags = {
            Staff:            interaction.client.emojis.cache.get('909196883514241068'),
            Partner:      interaction.client.emojis.cache.get('909196883560390758'),
            BugHunterLevel1:           interaction.client.emojis.cache.get('909196883916914788'),
            BugHunterLevel2:           interaction.client.emojis.cache.get('909196883971428382'),
            Hypesquad:            interaction.client.emojis.cache.get('909197289808093235'),
            HypeSquadOnlineHouse1:               interaction.client.emojis.cache.get('909196883862388756'),
            HypeSquadOnlineHouse2:            interaction.client.emojis.cache.get('909196883510038620'),
            HypeSquadOnlineHouse3:               interaction.client.emojis.cache.get('909196883824635944'),
            PremiumEarlySupporter:             interaction.client.emojis.cache.get('909196883916898344'),
            VerifiedDeveloper:          interaction.client.emojis.cache.get('909196883853991956'),
            CertifiedModerator: interaction.client.emojis.cache.get('909196883820433418'),
            TeamPseudoUser:                   'Team User',
            System:                      'System',
            VerifiedBot:                'Verified Bot',
        };

        const user = interaction.options.getUser('user');

        if (!user) {
            return await interaction.reply({ content: 'User could not be found in this server!', flags: MessageFlags.Ephemeral });
        }

        const guildMember = interaction.guild.members.cache.get(user.id);

        let createdAt = moment(guildMember.user.createdTimestamp).format('YYYY-MM-DD, hh:mm A');
        let date = moment(guildMember.joinedAt).format("YYYY-MM-DD, hh:mm A");
        const userFlags = guildMember.user.flags?.toArray() ?? [];

        let userBadges;
        if (userFlags.length > 0) {
            userBadges = userFlags.map(flag => flags[flag] ?? flag).join(', ');
        } else {
            userBadges = 'None';
        }

        let roles = guildMember.roles.cache.map(roles => `<@&${roles.id}>`);
        roles.pop();

        const embed = {
            title:       `${guildMember.user.tag} | ${guildMember.user.id}`,
            thumbnail:   {
                url: guildMember.user.displayAvatarURL({ forceStatic: false })
            },
            description: `Here is the information about <@${guildMember.user.id}>`,
            fields:      [
                {
                    name:   '\u200b',
                    value:  '\u200b',
                    inline: false,
                },
                {
                    name:   'User ID',
                    value:  `\`${guildMember.user.id}\``,
                    inline: true
                },
                {
                    name:   'Username',
                    value:  `\`${guildMember.user.tag}\``,
                    inline: true
                },
                {
                    name:   'Highest Role',
                    value:  `${guildMember.roles.highest.id === interaction.guild.id ? 'None' : guildMember.roles.highest.name}`,
                    inline: true
                },
                {
                    name:   'Joined Discord',
                    value:  `\`${createdAt}\``,
                    inline: true
                },
                {
                    name:   'Member Since',
                    value:  `\`${date}\``,
                    inline: true
                },
                {
                    name:   'Badge(s)',
                    value:  `${userBadges.toString()}`,
                    inline: true
                },
                {
                    name:   'Roles',
                    value:  `${roles.length ? roles.join(', ') : 'This user has no roles'.toString()}`,
                    inline: false
                },
            ],
            timestamp:   new Date().toISOString(),
            footer:      {
                text: interaction.client.user.username
            },
        };

        await interaction.reply({ embeds: [embed] });
    },
};
