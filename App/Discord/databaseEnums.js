'use strict';

const { ChannelType } = require('discord.js');

// discord.js v14 returns numeric enums. Preserve the strings stored by v13 so
// existing rows and consumers such as /serverinfo keep the same representation.
module.exports = {
    premiumTier: ['NONE', 'TIER_1', 'TIER_2', 'TIER_3'],
    defaultMessageNotifications: ['ALL_MESSAGES', 'ONLY_MENTIONS'],
    explicitContentFilter: ['DISABLED', 'MEMBERS_WITHOUT_ROLES', 'ALL_MEMBERS'],
    mfaLevel: ['NONE', 'ELEVATED'],
    verificationLevel: ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'],
    channelType: {
        [ChannelType.GuildText]: 'GUILD_TEXT',
        [ChannelType.DM]: 'DM',
        [ChannelType.GuildVoice]: 'GUILD_VOICE',
        [ChannelType.GroupDM]: 'GROUP_DM',
        [ChannelType.GuildCategory]: 'GUILD_CATEGORY',
        [ChannelType.GuildAnnouncement]: 'GUILD_NEWS',
        [ChannelType.AnnouncementThread]: 'GUILD_NEWS_THREAD',
        [ChannelType.PublicThread]: 'GUILD_PUBLIC_THREAD',
        [ChannelType.PrivateThread]: 'GUILD_PRIVATE_THREAD',
        [ChannelType.GuildStageVoice]: 'GUILD_STAGE_VOICE',
        [ChannelType.GuildDirectory]: 'GUILD_DIRECTORY',
        [ChannelType.GuildForum]: 'GUILD_FORUM',
        [ChannelType.GuildMedia]: 'GUILD_MEDIA',
    },
};
