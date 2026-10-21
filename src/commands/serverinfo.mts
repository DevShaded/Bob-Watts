import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { saveGuild } from '../resource-persistence.mjs';
import { botUser } from './bot-user.mjs';

const tiers: Readonly<Record<string, string>> = { NONE: 'Tier 0', TIER_1: 'Tier 1', TIER_2: 'Tier 2', TIER_3: 'Tier 3' };
const notifications: Readonly<Record<string, string>> = {
    ALL_MESSAGES: 'Receive notifications for all messages by default',
    ONLY_MENTIONS: 'Receive notifications only for @mentions',
};
const verification: Readonly<Record<string, string>> = {
    NONE: 'Unrestricted verification level', LOW: 'Must have verified email on Discord account',
    MEDIUM: 'Must be registered on Discord for longer than 5 minutes',
    HIGH: 'Must be a member of the server for longer than 10 minutes',
    VERY_HIGH: 'Must have a verified phone number on Discord account',
};

export const serverinfo: Command = {
    category: 'Public',
    data: new SlashCommandBuilder().setName('serverinfo').setDescription('Returns a message with server information'),
    async execute(interaction, context) {
        const unavailable = async (): Promise<void> => {
            await interaction.reply({ content: 'Server information is unavailable here.', flags: MessageFlags.Ephemeral });
        };
        if (!interaction.guild || !context.persistence || !context.getGuildInformation) return unavailable();
        const information = await context.getGuildInformation(interaction.guild.id);
        if (!information) return unavailable();
        let guild = await context.persistence.guild(information.guild.id);
        if (!guild?.GuildSettings[0]) {
            await saveGuild(context.persistence, information.guild);
            guild = await context.persistence.guild(information.guild.id);
        }
        const settings = guild?.GuildSettings[0];
        if (!guild || !settings) return unavailable();
        const emoji = (id: string, fallback: string): string => interaction.client.emojis.cache.get(id)?.toString() ?? fallback;
        const roles = information.roleIds.filter(id => id !== information.guild.id);
        const roleText = roles.length > 10 ? `This server has **${roles.length.toString()}** roles` : roles.map(id => `<@&${id}>`).join(', ') || 'This server has no roles';
        const timestamp = Math.round(new Date(guild.createdTimestamp).getTime() / 1000);
        await interaction.reply({ embeds: [{
            color: 0x17a2b8, title: settings.name,
            description: settings.description ?? 'This server does not have any description!',
            ...(settings.iconURL ? { thumbnail: { url: settings.iconURL } } : {}),
            fields: [
                { name: `${emoji('952556627863683135', '👑')} Server Owner`, value: `<@${settings.ownerID}>` },
                { name: '🆔 Owner ID', value: `\`${settings.ownerID}\``, inline: true },
                { name: '🆔 Server ID', value: `\`${guild.guildId}\``, inline: true },
                { name: '🤖 Bot Prefix', value: `\`${guild.prefix}\``, inline: true },
                { name: '\u200b', value: '\u200b', inline: false },
                { name: '📊 Member Count', value: String(guild.memberCount), inline: true },
                { name: '🟢 Online Members', value: information.onlineMembers.toString(), inline: true },
                { name: `${emoji('952571786791366776', '💎')} Boosting Count`, value: String(guild.premiumSubscriptionCount), inline: true },
                { name: `${emoji('909197289808093235', '✨')} Premium Tier`, value: tiers[guild.premiumTier] ?? guild.premiumTier, inline: true },
                { name: '☑️ Verified Server', value: guild.verified ? 'Server is verified' : 'Server is not verified', inline: true },
                { name: '📅 Server Created', value: `<t:${timestamp.toString()}:R>`, inline: true },
                { name: '📨 Rules', value: settings.rulesChannelID ? `<#${settings.rulesChannelID}>` : 'Rules channel has not been setup!', inline: false },
                { name: '📨 System Channel', value: settings.systemChannelID ? `<#${settings.systemChannelID}>` : 'System Channel has not been setup!', inline: false },
                { name: '📨 Notification Settings', value: notifications[settings.defaultMessageNotifications] ?? settings.defaultMessageNotifications, inline: false },
                { name: '🎚️ Verification Level', value: verification[settings.verificationLevel] ?? settings.verificationLevel, inline: false },
                { name: '🎚️ Server Roles', value: roleText, inline: false },
            ], timestamp: new Date().toISOString(), footer: { text: botUser(interaction).username },
        }] });
    },
};
