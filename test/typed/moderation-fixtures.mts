import { PermissionsBitField } from 'discord.js';
import type { ModerationDatabase, ModerationMember, InfractionRecord, InfractionWrite } from '../../src/moderation-contracts.mjs';
import { OfflineInteraction } from './discord.mjs';

export class ModerationStore implements ModerationDatabase {
    level: number | null = null;
    settings: { infractions_log: string | null; mute_role: string | null } | null = null;
    storedUser: Awaited<ReturnType<ModerationDatabase['users']['findUnique']>> = null;
    infractionFailure: Error | undefined;
    readonly messageQueries: Parameters<ModerationDatabase['messages']['findMany']>[0][] = [];
    readonly writes: InfractionWrite[] = [];
    readonly createdUsers: Parameters<ModerationDatabase['users']['create']>[0][] = [];
    records: InfractionRecord[] = [];
    readonly deletedInfractions: number[] = [];
    storedMessages: { messageId: string }[] = [];
    readonly deletedMessages: string[] = [];
    readonly deletedChannelMessages: string[] = [];
    readonly moderators = { findFirst: () => Promise.resolve(this.level === null ? null : { level: this.level }) };
    readonly users = {
        findUnique: (query: Parameters<ModerationDatabase['users']['findUnique']>[0]) => Promise.resolve(
            this.storedUser?.accountId === query.where.accountId ? this.storedUser
                : this.createdUsers.find(row => row.data.accountId === query.where.accountId)?.data ?? null,
        ),
        create: (query: Parameters<ModerationDatabase['users']['create']>[0]) => {
            this.createdUsers.push(query);
            return Promise.resolve();
        },
    };
    readonly guildLogs = { findUnique: () => Promise.resolve(this.settings) };
    readonly infractions = {
        create: ({ data }: { data: InfractionWrite }) => { if (this.infractionFailure) return Promise.reject(this.infractionFailure); this.writes.push(data); return Promise.resolve(); },
        findMany: (query: Parameters<ModerationDatabase['infractions']['findMany']>[0]) => {
            const rows = query.orderBy ? this.records.slice().sort((a, b) => b.id - a.id) : this.records;
            return Promise.resolve(query.take === undefined ? rows : rows.slice(0, query.take));
        },
        delete: ({ where }: { where: { id: number } }) => { this.deletedInfractions.push(where.id); return Promise.resolve(); },
    };
    readonly messages = {
        findMany: (query: Parameters<ModerationDatabase['messages']['findMany']>[0]) => { this.messageQueries.push(query); return Promise.resolve(this.storedMessages.slice(0, query.take)); },
        deleteMany: ({ where }: { where: { messageId: string } }) => { this.deletedMessages.push(where.messageId); return Promise.resolve(); },
    };
    readonly channelMessages = {
        deleteMany: ({ where }: { where: { messageId: string } }) => { this.deletedChannelMessages.push(where.messageId); return Promise.resolve(); },
    };
}

export class ModerationTarget implements ModerationMember {
    id = '999';
    user = {
        ...new OfflineInteraction().user, id: this.id, tag: 'Target#0001',
        username: 'Target', discriminator: '0001', bot: false,
        avatarURL: () => 'https://example.com/target.png',
    };
    displayAvatarURL = this.user.displayAvatarURL;
    joinedAt: Date | null = new Date('2021-02-03T00:00:00Z');
    permissions = new PermissionsBitField();
    bannable = true;
    kickable = true;
    readonly bans: { reason: string; deleteMessageSeconds: number }[] = [];
    readonly kicks: (string | undefined)[] = [];
    readonly addedRoles: string[] = [];
    readonly removedRoles: string[] = [];
    readonly disconnects: (string | undefined)[] = [];
    readonly dms: Parameters<ModerationMember['send']>[0][] = [];
    failure: Error | undefined;
    dmFailure: Error | undefined;
    roles = {
        cache: new Map<string, { id: string }>(), highest: { id: 'role', name: 'Member' },
        add: (role: string) => { this.addedRoles.push(role); return Promise.resolve(); },
        remove: (role: string) => { this.removedRoles.push(role); return Promise.resolve(); },
    };
    voice: ModerationMember['voice'] = {
        channel: { id: 'voice' },
        disconnect: reason => { this.disconnects.push(reason); return Promise.resolve(); },
    };
    ban(options: { reason: string; deleteMessageSeconds: number }): Promise<void> {
        if (this.failure) return Promise.reject(this.failure);
        this.bans.push(options);
        return Promise.resolve();
    }
    kick(reason?: string): Promise<void> { this.kicks.push(reason); return Promise.resolve(); }
    send(options: Parameters<ModerationMember['send']>[0]): Promise<void> { if (this.dmFailure) return Promise.reject(this.dmFailure); this.dms.push(options); return Promise.resolve(); }
}

export class ModerationInteraction extends OfflineInteraction {
    override client = { ...new OfflineInteraction().client, user: { ...new OfflineInteraction().client.user, id: 'bot' } };
    readonly target = new ModerationTarget();
    readonly executor = new ModerationTarget();
    readonly integers = new Map<string, number>();
    readonly unbans: string[] = [];
    unbanFailure: Error | undefined;
    memberFailure: Error | undefined;
    logFailure: Error | undefined;
    readonly logs: Parameters<ModerationMember['send']>[0][] = [];
    readonly deleted: string[] = [];
    readonly channels = new Map<string, {
        id: string;
        send?: (options: Parameters<ModerationMember['send']>[0]) => Promise<unknown>;
    }>();
    override options = {
        getString: (name: string): string | null => this.strings.get(name) ?? null,
        getUser: () => this.selectedUser,
        getInteger: (name: string): number | null => this.integers.get(name) ?? null,
    };
    channel = {
        id: 'channel',
        messages: { fetch: (id: string) => Promise.resolve({ delete: () => { this.deleted.push(id); return Promise.resolve(); } }) },
    };
    constructor(commandName: string) {
        super();
        this.commandName = commandName;
        this.selectedUser = this.target.user;
        this.executor.id = this.user.id;
        this.guild = {
            id: 'guild', name: 'Test server',
            members: {
                cache: this.members,
                fetch: id => id !== this.user.id && this.memberFailure ? Promise.reject(this.memberFailure) : Promise.resolve(id === this.user.id ? this.executor : this.target),
                unban: id => { if (this.unbanFailure) return Promise.reject(this.unbanFailure); this.unbans.push(id); return Promise.resolve(); },
            },
            channels: { cache: this.channels },
        };
        this.channels.set('log', { id: 'log', send: options => { if (this.logFailure) return Promise.reject(this.logFailure); this.logs.push(options); return Promise.resolve(); } });
    }
    deferReply(): Promise<void> { this.deferred = true; return Promise.resolve(); }
}
