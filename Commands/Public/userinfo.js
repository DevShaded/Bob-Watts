'use strict';

const moment = require("moment");
const { SlashCommandBuilder } = require('@discordjs/builders');

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
            DISCORD_EMPLOYEE:            interaction.client.emojis.cache.get('909196883514241068'),
            PARTNERED_SERVER_OWNER:      interaction.client.emojis.cache.get('909196883560390758'),
            BUGHUNTER_LEVEL_1:           interaction.client.emojis.cache.get('909196883916914788'),
            BUGHUNTER_LEVEL_2:           interaction.client.emojis.cache.get('909196883971428382'),
            HYPESQUAD_EVENTS:            interaction.client.emojis.cache.get('909197289808093235'),
            HOUSE_BRAVERY:               interaction.client.emojis.cache.get('909196883862388756'),
            HOUSE_BRILLIANCE:            interaction.client.emojis.cache.get('909196883510038620'),
            HOUSE_BALANCE:               interaction.client.emojis.cache.get('909196883824635944'),
            EARLY_SUPPORTER:             interaction.client.emojis.cache.get('909196883916898344'),
            VERIFIED_DEVELOPER:          interaction.client.emojis.cache.get('909196883853991956'),
            DISCORD_CERTIFIED_MODERATOR: interaction.client.emojis.cache.get('909196883820433418'),
            TEAM_USER:                   'Team User',
            SYSTEM:                      'System',
            VERIFIED_BOT:                'Verified Bot',
        };

        const user = interaction.options.getUser('user');

        if (!user) {
            return await interaction.reply({ content: 'User could not be found in this server!', ephemeral: true });
        }

        const guildMember = interaction.guild.members.cache.get(user.id);

        let createdAt = moment(guildMember.user.createdTimestamp).format('YYYY-MM-DD, hh:mm A');
        let date = moment(guildMember.joinedAt).format("YYYY-MM-DD, hh:mm A");
        const userFlags = guildMember.user.flags.toArray();

        let userBadges;
        if (userFlags.length === 1) {
            userBadges = userFlags.map(flag => flags[flag]).join(', ');
        } else {
            userBadges = 'None';
        }

        let roles = guildMember.roles.cache.map(roles => `<@&${roles.id}>`);
        roles.pop();

        const embed = {
            title:       `${guildMember.user.tag} | ${guildMember.user.id}`,
            thumbnail:   {
                url: guildMember.user.displayAvatarURL({ dynamic: true })
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
            timestamp:   new Date(),
            footer:      {
                text: interaction.client.user.username
            },
        };

        await interaction.reply({ embeds: [embed] });
    },
};
