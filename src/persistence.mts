import type { Prisma, PrismaClient, Guilds, GuildSettings, GuildLogs, Bot } from '@prisma/client';
import { createDatabase } from './database.mjs';
import type { DatabaseConfig } from './configuration.mjs';

export type StoredGuild = Pick<Guilds, 'guildId' | 'prefix' | 'memberCount' | 'premiumSubscriptionCount' | 'premiumTier' | 'verified' | 'createdTimestamp'> & {
    GuildSettings: Pick<GuildSettings, 'name' | 'description' | 'iconURL' | 'ownerID' | 'rulesChannelID' | 'systemChannelID' | 'defaultMessageNotifications' | 'verificationLevel'>[];
};

// Capabilities describe database operations, never an incomplete Prisma client.
export type EventGuildLogs = Pick<GuildLogs, 'welcome_log' | 'welcome_message' | 'goodbye_log' | 'goodbye_message' | 'join_role'>;
export type StoredActivity = Pick<Bot, 'name' | 'type' | 'url'>;

export interface Persistence {
    saveGuild(guild: Prisma.GuildsUncheckedCreateInput, settings: Prisma.GuildSettingsUncheckedCreateInput): Promise<void>;
    unavailableGuild(guildId: string): Promise<void>;
    saveUser(user: Prisma.UsersUncheckedCreateInput): Promise<void>;
    saveMember(member: Prisma.GuildMembersUncheckedCreateInput): Promise<void>;
    updateMemberCount(guildId: string, memberCount: number): Promise<void>;
    saveChannel(channel: Prisma.ChannelsUncheckedCreateInput): Promise<void>;
    saveGuildChannel(channel: Prisma.GuildChannelsUncheckedCreateInput): Promise<void>;
    saveThread(channel: Prisma.ThreadChannelsUncheckedCreateInput): Promise<void>;
    saveMessage(message: Prisma.MessagesUncheckedCreateInput, channelName: string): Promise<void>;
    guildLogs(guildId: string): Promise<EventGuildLogs | null>;
    guild(guildId: string): Promise<StoredGuild | null>;
    activity(): Promise<StoredActivity | null>;
}

export function createPersistence(source: DatabaseConfig | (() => PrismaClient)): Persistence {
    // Delay pool creation until an operation actually needs it.
    let database: PrismaClient | undefined;
    function db(): PrismaClient { database ??= typeof source === 'function' ? source() : createDatabase(source); return database; }
    return {
        async saveGuild(guild, settings) {
            await db().guilds.upsert({ where: { guildId: guild.guildId }, create: guild, update: guild });
            await db().guildSettings.upsert({ where: { guildId: settings.guildId }, create: settings, update: settings });
        },
        async unavailableGuild(guildId) {
            await db().guilds.updateMany({ where: { guildId }, data: { available: false } });
        },
        async saveUser(user) {
            await db().users.upsert({ where: { accountId: user.accountId }, create: user, update: user });
        },
        async saveMember(member) {
            await db().guildMembers.upsert({ where: { memberId: member.memberId }, create: member, update: member });
        },
        async updateMemberCount(guildId, memberCount) {
            await db().guilds.updateMany({ where: { guildId }, data: { memberCount } });
        },
        async saveChannel(channel) {
            await db().channels.upsert({ where: { channelId: channel.channelId }, create: channel, update: channel });
        },
        async saveGuildChannel(channel) {
            await db().guildChannels.upsert({ where: { channelId: channel.channelId }, create: channel, update: channel });
        },
        async saveThread(channel) {
            await db().threadChannels.upsert({ where: { threadId: channel.threadId }, create: channel, update: channel });
        },
        async saveMessage(message, channelName) {
            // Preserve one pair of associations per new message; duplicate delivery
            // must not create associations without a corresponding new message.
            await db().$transaction(async transaction => {
                const existing = await transaction.messages.findUnique({ where: { messageId: message.messageId } });
                if (existing) return;
                await transaction.messages.create({
                    data: {
                        ...message,
                        ChannelMessages: { create: { channelId: message.channelId, channelName } },
                    },
                });
                await transaction.userChannels.create({ data: { accountId: message.accountId, channelId: message.channelId } });
            });
        },
        guildLogs: guildId => db().guildLogs.findUnique({ where: { guildId } }),
        guild: guildId => db().guilds.findUnique({ where: { guildId }, include: { GuildSettings: true } }),
        activity: () => db().bot.findFirst({ orderBy: { id: 'desc' } }),
    };
}
