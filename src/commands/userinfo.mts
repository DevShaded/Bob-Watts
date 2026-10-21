import moment from 'moment';
import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { botUser } from './bot-user.mjs';

export const userinfo: Command = {
    category: 'Public',
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display information about the mentioned user in a server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Choose the user you want to get info about!')
                .setRequired(true)),
    async execute(interaction) {
        const flags: Readonly<Record<string, string | undefined>> = {
            Staff:            interaction.client.emojis.cache.get('909196883514241068')?.toString(),
            Partner:      interaction.client.emojis.cache.get('909196883560390758')?.toString(),
            BugHunterLevel1:           interaction.client.emojis.cache.get('909196883916914788')?.toString(),
            BugHunterLevel2:           interaction.client.emojis.cache.get('909196883971428382')?.toString(),
            Hypesquad:            interaction.client.emojis.cache.get('909197289808093235')?.toString(),
            HypeSquadOnlineHouse1:               interaction.client.emojis.cache.get('909196883862388756')?.toString(),
            HypeSquadOnlineHouse2:            interaction.client.emojis.cache.get('909196883510038620')?.toString(),
            HypeSquadOnlineHouse3:               interaction.client.emojis.cache.get('909196883824635944')?.toString(),
            PremiumEarlySupporter:             interaction.client.emojis.cache.get('909196883916898344')?.toString(),
            VerifiedDeveloper:          interaction.client.emojis.cache.get('909196883853991956')?.toString(),
            CertifiedModerator: interaction.client.emojis.cache.get('909196883820433418')?.toString(),
            TeamPseudoUser:                   'Team User',
            System:                      'System',
            VerifiedBot:                'Verified Bot',

        };
        const user = interaction.options.getUser('user');
        const guild = interaction.guild;
        const guildMember = user && guild?.members.cache.get(user.id);
        if (!user || !guild || !guildMember) {
            await interaction.reply({ content: 'User could not be found in this server!', flags: MessageFlags.Ephemeral });
            return;
        }
        const createdAt = moment(guildMember.user.createdTimestamp).format('YYYY-MM-DD, hh:mm A');
        const date = guildMember.joinedAt
            ? moment(guildMember.joinedAt).format('YYYY-MM-DD, hh:mm A') : 'Unknown';
        const userFlags = guildMember.user.flags?.toArray() ?? [];
        const userBadges = userFlags.length ? userFlags.map(flag => flags[flag] ?? flag).join(', ') : 'None';
        const roles = [...guildMember.roles.cache.values()]
            .filter(role => role.id !== guild.id).map(role => `<@&${role.id}>`);
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
                    value:  guildMember.roles.highest.id === guild.id ? 'None' : guildMember.roles.highest.name,
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
                    value:  userBadges,
                    inline: true
                },
                {
                    name:   'Roles',
                    value:  roles.length ? roles.join(', ') : 'This user has no roles',
                    inline: false
                },
            ],
            timestamp:   new Date().toISOString(),
            footer:      {
                text: botUser(interaction).username
            },
        };

        await interaction.reply({ embeds: [embed] });
    },
};
