import type { Prisma } from '@prisma/client';
import moment from 'moment';
import type { GuildState, UserState } from './event-resources.mjs';
import { databaseEnums } from './database-enums.mjs';

export function serializeUser(user: UserState) {
    return {
        accountId: user.id, username: user.username, discriminator: user.discriminator,
        avatar: user.avatarURL({ forceStatic: false }), bot: user.bot,
        createdTimestamp: moment(user.createdTimestamp).format('YYYY-MM-DD HH-mm-ss'),
    } satisfies Prisma.UsersCreateInput;
}

export function serializeGuild(guild: GuildState) {
    return {
        guildId: guild.id, available: guild.available,
        createdTimestamp: moment(guild.createdTimestamp).format('YYYY-MM-DD'),
        joinedTimestamp: moment(guild.joinedTimestamp).format('YYYY-MM-DD HH-mm-ss'),
        large: guild.large, maximumMembers: guild.maximumMembers, maximumPresences: guild.maximumPresences,
        memberCount: guild.memberCount, partnered: guild.partnered,
        premiumSubscriptionCount: guild.premiumSubscriptionCount,
        premiumTier: databaseEnums.premiumTier[guild.premiumTier], verified: guild.verified,
    } satisfies Prisma.GuildsCreateInput;
}

export function serializeGuildSettings(guild: GuildState) {
    return {
        afkChannelID: guild.afkChannelId, afkTimeout: guild.afkTimeout,
        bannerURL: guild.bannerURL({ forceStatic: false }),
        defaultMessageNotifications: databaseEnums.defaultMessageNotifications[guild.defaultMessageNotifications],
        description: guild.description, explicitContentFilter: databaseEnums.explicitContentFilter[guild.explicitContentFilter],
        iconURL: guild.iconURL({ forceStatic: false }), mfaLevel: databaseEnums.mfaLevel[guild.mfaLevel],
        name: guild.name, nameAcronym: guild.nameAcronym, ownerID: guild.ownerId,
        preferredLocale: guild.preferredLocale, rulesChannelID: guild.rulesChannelId, shardID: guild.shardId,
        splashURL: guild.splashURL(), systemChannelID: guild.systemChannelId,
        publicUpdatesChannelId: guild.publicUpdatesChannelId, vanityURLCode: guild.vanityURLCode,
        verificationLevel: databaseEnums.verificationLevel[guild.verificationLevel],
    } satisfies Omit<Prisma.GuildSettingsUncheckedCreateInput, 'guildId'>;
}
