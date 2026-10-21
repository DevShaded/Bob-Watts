import { Locale, GuildPremiumTier, GuildDefaultMessageNotifications, GuildExplicitContentFilter, GuildMFALevel, GuildVerificationLevel, ChannelType, ThreadAutoArchiveDuration } from 'discord.js';
import type { GuildState, UserState, MemberState, ChannelState, ThreadState, MessageState } from '../../src/event-resources.mjs';
import type { Persistence } from '../../src/persistence.mjs';
export function offlinePersistence(): Persistence {
    const done = (): Promise<void> => Promise.resolve();
    return {
        saveGuild: done, unavailableGuild: done, saveUser: done, saveMember: done,
        updateMemberCount: done, saveChannel: done, saveGuildChannel: done,
        saveThread: done, saveMessage: done, guildLogs: () => Promise.resolve(null),
        guild: () => Promise.resolve(null), activity: () => Promise.resolve(null),
    };
}
export function guildState(): GuildState {
    return {
        id: 'guild', name: 'Example', available: true, createdTimestamp: Date.UTC(2020, 0, 1),
        joinedTimestamp: Date.UTC(2021, 0, 1), large: false, maximumMembers: 100,
        maximumPresences: null, memberCount: 7, partnered: false, premiumSubscriptionCount: 2,
        premiumTier: GuildPremiumTier.Tier1, verified: false, afkChannelId: null, afkTimeout: 300,
        bannerURL: () => null, defaultMessageNotifications: GuildDefaultMessageNotifications.OnlyMentions, description: null,
        explicitContentFilter: GuildExplicitContentFilter.AllMembers, iconURL: () => null, mfaLevel: GuildMFALevel.Elevated, nameAcronym: 'E',
        ownerId: 'owner', preferredLocale: Locale.EnglishUS, rulesChannelId: null, shardId: 0,
        splashURL: () => null, systemChannelId: null, publicUpdatesChannelId: null,
        vanityURLCode: null, verificationLevel: GuildVerificationLevel.VeryHigh,
    };
}
export function userState(): UserState {
    return {
        id: 'user', username: 'Alice', discriminator: '0', bot: false,
        createdTimestamp: Date.UTC(2019, 0, 1), avatarURL: () => null,
        tag: 'Alice', displayAvatarURL: () => 'https://example.com/alice.png',
    };
}
export function memberState(): MemberState {
    return {
        id: 'user', guild: guildState(), user: userState(), bannable: false,
        displayColor: 0, displayHexColor: '#000000', displayName: 'Alice',
        joinedTimestamp: null, kickable: false, manageable: false, nickname: null,
        premiumSinceTimestamp: null, roles: { cache: new Map(), add: () => Promise.resolve() },
    };
}
export function channelState(): ChannelState {
    return {
        id: 'channel', name: 'general', type: ChannelType.GuildText, createdTimestamp: Date.UTC(2020, 0, 1),
        deletable: true, manageable: true, parentId: null, permissionsLocked: null,
        position: 0, rawPosition: 0, viewable: true, nsfw: false, topic: null,
    };
}
export function threadState(): ThreadState {
    return {
        id: 'thread', name: 'discussion', type: ChannelType.PublicThread, createdTimestamp: Date.UTC(2020, 0, 1),
        ownerId: 'owner', archived: false, archivedAt: null, archiveTimestamp: null,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneHour, editable: true, invitable: true, joinable: true, joined: true,
        locked: false, manageable: true, memberCount: 2, unarchivable: true,
    };
}
export function messageState(): MessageState {
    return {
        id: 'message', author: userState(), webhookId: null, content: 'Hello',
        url: 'https://discord.com/channels/guild/channel/message', guild: guildState(),
        member: memberState(), channel: channelState(), fetchUser: () => Promise.resolve(null), reply: () => Promise.resolve(),
    };
}
