import type { Prisma, GuildLogs } from '@prisma/client';
import type { ModeratorStore } from './moderator-level.mjs';

export interface SettingsDatabase {
    readonly moderators: ModeratorStore & {
        create(query: { data: { guildId: string; accountId: string; level: number } }): Promise<unknown>;
        deleteMany(query: { where: { guildId: string; accountId: string } }): Promise<unknown>;
    };
    readonly guildLogs: {
        findUnique(query: { where: { guildId: string } }): Promise<GuildLogValues | null>;
        create(query: { data: Prisma.GuildLogsUncheckedCreateInput }): Promise<unknown>;
        update(query: { where: { guildId: string }; data: GuildLogPatch }): Promise<unknown>;
    };
    readonly users: {
        findUnique(query: { where: { accountId: string } }): Promise<{ accountId: string } | null>;
        create(query: { data: Prisma.UsersCreateInput }): Promise<unknown>;
    };
    readonly guilds: {
        findUnique(query: { where: { guildId: string } }): Promise<{ guildId: string } | null>;
        create(query: { data: Prisma.GuildsCreateInput }): Promise<unknown>;
    };
}

export type GuildLogField = 'welcome_log' | 'goodbye_log' | 'edit_log' | 'delete_log' |
    'infractions_log' | 'mute_role' | 'join_role' | 'welcome_message' | 'goodbye_message';
export type GuildLogValues = Pick<GuildLogs, GuildLogField>;
export type GuildLogPatch = Partial<GuildLogValues>;
