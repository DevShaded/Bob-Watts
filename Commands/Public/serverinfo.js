'use strict';

const prisma = require('../../App/Database');
const { SlashCommandBuilder } = require('discord.js');
const Message = require('../../App/Discord/Message');

const data = new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Returns a message with server information');

module.exports = {
    data:        data,
    name:        'serverinfo',
    description: `Returns a message with server information`,
    execute:     async (interaction) => {
        let getGuild = await prisma.guilds.findUnique({
            where: {
                guildId: interaction.guild.id
            },

            include: {
                GuildSettings: true,
            },
        });

        if (!getGuild) {
            const messageClass = new Message(interaction);
            await messageClass.createGuild();
        }

        getGuild = await prisma.guilds.findUnique({
            where: {
                guildId: interaction.guild.id
            },

            include: {
                GuildSettings: true,
            },
        });

        const serverOwnerEmoji = interaction.client.emojis.cache.get('952556627863683135');
        const nitroBadge = interaction.client.emojis.cache.get('952571786791366776');
        const hypesquadBadge = interaction.client.emojis.cache.get('909197289808093235');

        let GUILD_MEMBERS = await interaction.client.guilds.cache.get(getGuild.guildId).members.fetch({ withPresences: true });
        let online = GUILD_MEMBERS.filter((online) => online.presence?.status === "online").size;
        let dnd = GUILD_MEMBERS.filter((online) => online.presence?.status === "dnd").size;
        let onlineMembers = online + dnd;

        let premiumTier;
        premiumTier = getGuild.premiumTier;

        switch (premiumTier) {
            case 'NONE':
                premiumTier = 'Tier 0';
                break;
            case 'TIER_1':
                premiumTier = 'Tier 1';
                break;
            case 'TIER_2':
                premiumTier = 'Tier 2';
                break;
            case 'TIER_3':
                premiumTier = 'Tier 3'
                break;
        }

        let notificationSettings;
        notificationSettings = getGuild['GuildSettings'][0].defaultMessageNotifications;

        switch (notificationSettings) {
            case 'ALL_MESSAGES':
                notificationSettings = 'Receive notifications for all messages by default';
                break;
            case 'ONLY_MENTIONS':
                notificationSettings = 'Receive notifications only for @mentions';
                break;
        }

        let verificationLevel;
        verificationLevel = getGuild['GuildSettings'][0].verificationLevel;

        switch (verificationLevel) {
            case 'NONE':
                verificationLevel = 'Unrestricted verification level';
                break;
            case 'LOW':
                verificationLevel = 'Must have verified email on Discord account';
                break;
            case 'MEDIUM':
                verificationLevel = 'Must be registered on Discord for longer than 5 minutes';
                break;
            case 'HIGH':
                verificationLevel = 'Must be a member of the server for longer than 10 minutes';
                break;
            case 'VERY_HIGH':
                verificationLevel = 'Must have a verified phone number on Discord account';
                break;
        }

        const unixTimestamp = (new Date(getGuild.createdTimestamp).getTime() / 1000).toFixed(0);

        let roles = interaction.guild.roles.cache.map(roles => `<@&${roles.id}>`);
        roles.shift();

        if (roles.length > 10) {
            roles = `This server has **${roles.length}** roles`;
        } else {
            roles = roles.join(', ');
        }

        const embed = {
            color:       0x17a2b8,
            title:       getGuild['GuildSettings'][0].name,
            description: getGuild['GuildSettings'][0].description ?? 'This server does not have any description!',
            thumbnail: getGuild.GuildSettings[0].iconURL
                ? { url: getGuild.GuildSettings[0].iconURL }
                : undefined,
            fields:      [
                {
                    name:  `${serverOwnerEmoji} Server Owner`,
                    value: `<@${getGuild['GuildSettings'][0].ownerID}>`,
                },
                {
                    name:   '🆔 Owner ID',
                    value:  `\`${getGuild['GuildSettings'][0].ownerID}\``,
                    inline: true,
                },
                {
                    name:   '🆔 Server ID',
                    value:  `\`${getGuild.guildId}\``,
                    inline: true,
                },
                {
                    name:   '🤖 Bot Prefix',
                    value:  `\`${getGuild.prefix}\``,
                    inline: true,
                },
                {
                    name:   '\u200b',
                    value:  '\u200b',
                    inline: false,
                },
                {
                    name:   '📊 Member Count',
                    value:  `${getGuild.memberCount}`,
                    inline: true,
                },
                {
                    name:   '🟢 Online Members',
                    value:  `${onlineMembers}`,
                    inline: true,
                },
                {
                    name:   `${nitroBadge} Boosting Count`,
                    value:  `${getGuild.premiumSubscriptionCount}`,
                    inline: true,
                },
                {
                    name:   `${hypesquadBadge} Premium Tier`,
                    value:  `${premiumTier}`,
                    inline: true,
                },
                {
                    name:   '☑️ Verified Server',
                    value:  `${getGuild.verified ? 'Server is verified' : 'Server is not verified'}`,
                    inline: true,
                },
                {
                    name:   `📅 Server Created`,
                    value:  `<t:${unixTimestamp}:R>`,
                    inline: true,
                },
                {
                    name:   `📨 Rules`,
                    value:  `${getGuild['GuildSettings'][0].rulesChannelID ? '<#' + getGuild['GuildSettings'][0].rulesChannelID + '>' : 'Rules channel has not been setup!'}`,
                    inline: false,
                },
                {
                    name:   `📨 System Channel`,
                    value:  `${getGuild['GuildSettings'][0].systemChannelID ? '<#' + getGuild['GuildSettings'][0].systemChannelID + '>' : 'System Channel has not been setup!'}`,
                    inline: false,
                },
                {
                    name:   `📨 Notification Settings`,
                    value:  `${notificationSettings}`,
                    inline: false,
                },
                {
                    name:   `🎚️ Verification Level`,
                    value:  `${verificationLevel}`,
                    inline: false,
                },
                {
                    name:   `🎚️ Server Roles`,
                    value:  `${roles}`,
                    inline: false,
                },
            ],
            timestamp:   new Date().toISOString(),
            footer:      {
                text: interaction.client.user.username,
            },
        };

        await interaction.reply({ embeds: [embed] });
    },
};
