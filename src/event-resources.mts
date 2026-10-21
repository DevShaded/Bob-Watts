import type { Guild, GuildMember, User, GuildChannel, ThreadChannel, MessageReplyOptions, MessageCreateOptions, ActivityOptions } from 'discord.js';

export type GuildState = Pick<Guild,
    'id' | 'name' | 'available' | 'createdTimestamp' | 'joinedTimestamp' | 'large' |
    'maximumMembers' | 'maximumPresences' | 'memberCount' | 'partnered' |
    'premiumSubscriptionCount' | 'premiumTier' | 'verified' | 'afkChannelId' |
    'afkTimeout' | 'bannerURL' | 'defaultMessageNotifications' | 'description' |
    'explicitContentFilter' | 'iconURL' | 'mfaLevel' | 'nameAcronym' | 'ownerId' |
    'preferredLocale' | 'rulesChannelId' | 'shardId' | 'splashURL' | 'systemChannelId' |
    'publicUpdatesChannelId' | 'vanityURLCode' | 'verificationLevel'>;
export type UserState = Pick<User, 'id' | 'username' | 'discriminator' | 'bot' | 'createdTimestamp' | 'avatarURL' | 'tag' | 'displayAvatarURL'>;
export type MemberState = Pick<GuildMember, 'id' | 'bannable' | 'displayColor' | 'displayHexColor' | 'displayName' | 'joinedTimestamp' | 'kickable' | 'manageable' | 'nickname' | 'premiumSinceTimestamp'> & {
    readonly guild: GuildState;
    readonly user: UserState;
    readonly roles: {
        readonly cache: ReadonlyMap<string, { readonly id: string }>;
        add(role: string): Promise<unknown>;
    };
};
export type RemovedMember = { readonly guild: GuildState; readonly user: UserState | null };
export type ChannelState = Pick<GuildChannel, 'id' | 'name' | 'type' | 'createdTimestamp' | 'deletable' | 'manageable' | 'parentId' | 'permissionsLocked' | 'position' | 'rawPosition' | 'viewable'> & {
    readonly nsfw?: boolean;
    readonly topic?: string | null;
};
export type ThreadState = Pick<ThreadChannel, 'id' | 'name' | 'type' | 'createdTimestamp' | 'ownerId' | 'archived' | 'archivedAt' | 'archiveTimestamp' | 'autoArchiveDuration' | 'editable' | 'invitable' | 'joinable' | 'joined' | 'locked' | 'manageable' | 'memberCount' | 'unarchivable'>;
export interface MessageState {
    readonly id: string;
    readonly author: UserState;
    readonly webhookId: string | null;
    readonly content: string;
    readonly url: string;
    readonly guild: GuildState | null;
    readonly member: MemberState | null;
    readonly channel: ChannelState | ThreadState | null;
    fetchUser(id: string): Promise<UserState | null>;
    reply(options: MessageReplyOptions): Promise<unknown>;
}
export interface ReadyClient {
    readonly username: string;
    setActivity(name: string, options: Omit<ActivityOptions, 'name'>): unknown;
}
export type SendLog = (guildId: string, channelId: string, options: MessageCreateOptions) => Promise<void>;

export interface GuildInformation {
    readonly guild: GuildState;
    readonly onlineMembers: number;
    readonly roleIds: readonly string[];
}
export type GetGuildInformation = (guildId: string) => Promise<GuildInformation | null>;
