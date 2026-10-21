import type { APIEmbed, GuildMember, PermissionsBitField, User } from 'discord.js';
import type { CommandMember, CommandUser } from './contracts.mjs';
import type { ModeratorStore } from './moderator-level.mjs';

// GuildMember remains structurally compatible with this deliberately small boundary.
export interface ModerationMember extends CommandMember, Pick<GuildMember, 'displayAvatarURL'> {
    readonly id: string;
    readonly user: CommandUser & Pick<User, 'username' | 'discriminator' | 'avatarURL' | 'bot'>;
    readonly permissions: Pick<PermissionsBitField, 'has'>;
    readonly bannable: boolean;
    readonly kickable: boolean;
    readonly roles: CommandMember['roles'] & {
        add(role: string): Promise<unknown>;
        remove(role: string): Promise<unknown>;
    };
    readonly voice: {
        readonly channel: { readonly id: string } | null;
        disconnect(reason?: string): Promise<unknown>;
    };
    ban(options: { reason: string; deleteMessageSeconds: number }): Promise<unknown>;
    kick(reason?: string): Promise<unknown>;
    send(options: { embeds: APIEmbed[] }): Promise<unknown>;
}

export interface ModerationChannel {
    readonly id: string;
    send?(options: { embeds: APIEmbed[] }): Promise<unknown>;
    readonly messages?: {
        fetch(id: string): Promise<{ delete(): Promise<unknown> }>;
    };
}

export interface InfractionWrite {
    guildId: string;
    accountId: string;
    reason: string;
    type: string;
    expires: string | null;
}

export interface InfractionRecord {
    readonly id: number;
    readonly type: string;
    readonly reason: string;
}

export interface ModerationDatabase {
    $disconnect?(): Promise<void>;
    readonly moderators: ModeratorStore;
    readonly users: {
        findUnique(query: { where: { accountId: string } }): Promise<{ accountId: string; username: string | null; discriminator: string | null; avatar: string | null } | null>;
        create(query: { data: { accountId: string; username: string; discriminator: string; avatar: string | null; bot: boolean; createdTimestamp: string } }): Promise<unknown>;
    };
    readonly guildLogs: {
        findUnique(query: { where: { guildId: string } }): Promise<{ infractions_log: string | null; mute_role: string | null } | null>;
    };
    readonly infractions: {
        create(query: { data: InfractionWrite }): Promise<unknown>;
        findMany(query: { where: { guildId: string; accountId: string }; orderBy?: { id: 'desc' }[]; take?: number }): Promise<readonly InfractionRecord[]>;
        delete(query: { where: { id: number } }): Promise<unknown>;
    };
    readonly messages: {
        findMany(query: { where: { guildId: string; channelId: string; accountId: string }; orderBy: { id: 'desc' }[]; take: number }): Promise<readonly { messageId: string }[]>;
        deleteMany(query: { where: { messageId: string } }): Promise<unknown>;
    };
    readonly channelMessages: {
        deleteMany(query: { where: { messageId: string } }): Promise<unknown>;
    };
}

export type ModerationSchedule = (delayMs: number, action: () => Promise<void>) => void;
