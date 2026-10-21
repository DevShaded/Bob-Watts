import { PermissionsBitField, ChannelType, Locale, GuildPremiumTier, GuildDefaultMessageNotifications, GuildExplicitContentFilter, GuildMFALevel, GuildVerificationLevel } from 'discord.js';
import type { InteractionEditReplyOptions, InteractionReplyOptions } from 'discord.js';
import type { CommandInteraction, CommandMember, CommandUser, Gateway, RegisteredEvent } from '../../src/contracts.mjs';

export class OfflineGateway implements Gateway {
    readonly events: RegisteredEvent[] = [];
    readonly tokens: string[] = [];
    destroyed = false;

    subscribe(event: RegisteredEvent): void {
        this.events.push(event);
    }

    login(token: string): Promise<string> {
        this.tokens.push(token);
        return Promise.resolve(token);
    }

    destroy(): Promise<void> {
        this.destroyed = true;
        return Promise.resolve();
    }

    async dispatch(interaction: CommandInteraction | null): Promise<void> {
        for (const event of [...this.events]) {
            if (event.name !== 'interactionCreate') continue;
            if (event.once) this.events.splice(this.events.indexOf(event), 1);
            await event.execute(interaction);
        }
    }

    async ready(): Promise<void> {
        for (const event of [...this.events]) {
            if (event.name !== 'clientReady') continue;
            if (event.once) this.events.splice(this.events.indexOf(event), 1);
            await event.execute();
        }
    }
}

export class OfflineInteraction implements CommandInteraction {
    commandName = 'ping';
    client = {
        ws: { ping: 42 },
        user: {
            username: 'Test bot', createdAt: new Date(2020, 0, 1),
            displayAvatarURL: () => 'https://example.com/bot.png',
        },
        emojis: { cache: new Map<string, { toString(): string }>() },
        guilds: { cache: { size: 1234 } }, users: { cache: { size: 5678 } },
    } satisfies CommandInteraction['client'];
    user: CommandUser = {
        username: 'Test user', discriminator: '0', bot: false, avatarURL: () => null, send: () => Promise.resolve(),
        id: '123456789012345678', tag: 'Test user',
        createdTimestamp: Date.UTC(2020, 0, 1),
        displayAvatarURL: () => 'https://example.com/avatar.png', flags: null,
    };
    readonly strings = new Map<string, string>();
    selectedUser: CommandUser | null = this.user;
    subcommand = 'joinchannel';
    selectedChannel: { id: string; type: ChannelType } | null = { id: 'channel', type: ChannelType.GuildText };
    selectedRole: { id: string } | null = { id: 'role' };
    administrator = false;
    options = {
        getSubcommand: () => this.subcommand,
        getChannel: () => this.selectedChannel,
        getRole: () => this.selectedRole,
        getString: (name: string): string | null => this.strings.get(name) ?? null,
        getUser: (): CommandUser | null => this.selectedUser,
    };
    readonly members = new Map<string, CommandMember>();
    guild: CommandInteraction['guild'] = {
        id: '234567890123456789', members: { cache: this.members, fetch: () => Promise.resolve({ permissions: new PermissionsBitField(this.administrator ? ['Administrator'] : []) }) },
        name: 'Test guild', createdTimestamp: Date.UTC(2020, 0, 1), joinedTimestamp: Date.UTC(2021, 0, 1),
        available: true, large: false, maximumMembers: 100, maximumPresences: null,
        memberCount: 10, partnered: false, premiumSubscriptionCount: 0, premiumTier: GuildPremiumTier.None,
        verified: false, afkChannelId: null, afkTimeout: 60, bannerURL: () => null,
        defaultMessageNotifications: GuildDefaultMessageNotifications.AllMessages, description: null, explicitContentFilter: GuildExplicitContentFilter.Disabled,
        iconURL: () => null, mfaLevel: GuildMFALevel.None, nameAcronym: 'TG', ownerId: 'owner',
        preferredLocale: Locale.EnglishUS, rulesChannelId: null, shardId: 0, splashURL: () => null,
        systemChannelId: null, publicUpdatesChannelId: null, vanityURLCode: null, verificationLevel: GuildVerificationLevel.None,
    };
    deferred = false;
    replied = false;
    replyFailure: Error | undefined;
    readonly responses: {
        method: 'reply' | 'editReply' | 'followUp';
        payload: InteractionReplyOptions | InteractionEditReplyOptions;
    }[] = [];

    reply(payload: InteractionReplyOptions): Promise<void> {
        if (this.replyFailure) {
            const error = this.replyFailure;
            this.replyFailure = undefined;
            return Promise.reject(error);
        }
        this.responses.push({ method: 'reply', payload });
        this.replied = true;
        return Promise.resolve();
    }

    editReply(payload: InteractionEditReplyOptions): Promise<void> {
        this.responses.push({ method: 'editReply', payload });
        return Promise.resolve();
    }

    followUp(payload: InteractionReplyOptions): Promise<void> {
        this.responses.push({ method: 'followUp', payload });
        return Promise.resolve();
    }
}

export const startupEnvironment = {
    APP_ENV: 'development', APP_TOKEN: 'offline-token',
    APP_GUILD_ID: '456', APP_CHANNEL_ID: '789',
    DATABASE_URL: 'mysql://offline:offline@127.0.0.1:1/offline',
};
