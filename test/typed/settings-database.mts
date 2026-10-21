import type { Prisma } from '@prisma/client';
import type { SettingsDatabase, GuildLogPatch, GuildLogValues } from '../../src/settings-database.mjs';

export class OfflineSettingsDatabase implements SettingsDatabase {
    readonly levels = new Map<string, number>();
    log: GuildLogValues | null = null;
    readonly logWrites: { guildId: string; data: GuildLogPatch }[] = [];
    readonly moderatorWrites: { guildId: string; accountId: string; level: number }[] = [];
    readonly moderatorDeletes: { guildId: string; accountId: string }[] = [];
    readonly userWrites: Prisma.UsersCreateInput[] = [];
    readonly guildWrites: Prisma.GuildsCreateInput[] = [];
    failWrite = false;
    guildExists = true;
    userExists = true;
    readonly guildLogs: SettingsDatabase['guildLogs'] = {
        findUnique: () => Promise.resolve(this.log),
        create: ({ data }) => {
            if (this.failWrite) return Promise.reject(new Error('offline write failed'));
            this.logWrites.push({ guildId: data.guildId, data });
            return Promise.resolve();
        },
        update: ({ where, data }) => {
            if (this.failWrite) return Promise.reject(new Error('offline write failed'));
            this.logWrites.push({ guildId: where.guildId, data });
            return Promise.resolve();
        },
    };
    readonly moderators: SettingsDatabase['moderators'] = {
        findFirst: ({ where }) => {
            const level = this.levels.get(`${where.guildId}:${where.accountId}`);
            return Promise.resolve(level !== undefined && (where.level === undefined || level === where.level) ? { level } : null);
        },
        create: ({ data }) => { this.moderatorWrites.push(data); return Promise.resolve(); },
        deleteMany: ({ where }) => { this.moderatorDeletes.push(where); return Promise.resolve(); },
    };
    readonly users: SettingsDatabase['users'] = {
        findUnique: ({ where }) => Promise.resolve(this.userExists ? where : null),
        create: ({ data }) => { this.userWrites.push(data); return Promise.resolve(); },
    };
    readonly guilds: SettingsDatabase['guilds'] = {
        findUnique: ({ where }) => Promise.resolve(this.guildExists ? where : null),
        create: ({ data }) => { this.guildWrites.push(data); return Promise.resolve(); },
    };
}
