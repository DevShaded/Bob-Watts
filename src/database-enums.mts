import {
    ChannelType,
    GuildDefaultMessageNotifications,
    GuildExplicitContentFilter,
    GuildMFALevel,
    GuildPremiumTier,
    GuildVerificationLevel,
} from 'discord.js';

// discord.js v14 returns numeric enums. Preserve the strings stored by v13 so
// existing rows and consumers such as /serverinfo keep the same representation.
export const databaseEnums = {
    premiumTier: {
        [GuildPremiumTier.None]: 'NONE',
        [GuildPremiumTier.Tier1]: 'TIER_1',
        [GuildPremiumTier.Tier2]: 'TIER_2',
        [GuildPremiumTier.Tier3]: 'TIER_3',
    } satisfies Record<GuildPremiumTier, string>,
    defaultMessageNotifications: {
        [GuildDefaultMessageNotifications.AllMessages]: 'ALL_MESSAGES',
        [GuildDefaultMessageNotifications.OnlyMentions]: 'ONLY_MENTIONS',
    } satisfies Record<GuildDefaultMessageNotifications, string>,
    explicitContentFilter: {
        [GuildExplicitContentFilter.Disabled]: 'DISABLED',
        [GuildExplicitContentFilter.MembersWithoutRoles]: 'MEMBERS_WITHOUT_ROLES',
        [GuildExplicitContentFilter.AllMembers]: 'ALL_MEMBERS',
    } satisfies Record<GuildExplicitContentFilter, string>,
    mfaLevel: {
        [GuildMFALevel.None]: 'NONE',
        [GuildMFALevel.Elevated]: 'ELEVATED',
    } satisfies Record<GuildMFALevel, string>,
    verificationLevel: {
        [GuildVerificationLevel.None]: 'NONE',
        [GuildVerificationLevel.Low]: 'LOW',
        [GuildVerificationLevel.Medium]: 'MEDIUM',
        [GuildVerificationLevel.High]: 'HIGH',
        [GuildVerificationLevel.VeryHigh]: 'VERY_HIGH',
    } satisfies Record<GuildVerificationLevel, string>,
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
    } satisfies Record<ChannelType, string>,
};
