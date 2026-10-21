import type { ModerationChannel, ModerationDatabase, ModerationMember, ModerationSchedule } from './moderation-contracts.mjs';
import type { ReadyClient, GuildState, MemberState, RemovedMember, MessageState, SendLog, GetGuildInformation } from './event-resources.mjs';
import type { Persistence } from './persistence.mjs';
import type { SettingsDatabase } from './settings-database.mjs';
import type {
    ClientOptions,
    InteractionEditReplyOptions,
    InteractionDeferReplyOptions,
    InteractionReplyOptions,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    User,
    Guild,
    PermissionsBitField,
    ChannelType,
    MessageCreateOptions,
    UserFlagsBitField,
} from 'discord.js';

export type CommandCategory = 'Fun' | 'Moderation' | 'Public' | 'Settings' | 'Information';

export const commandCategories: readonly CommandCategory[] = [
    'Fun', 'Moderation', 'Public', 'Settings', 'Information',
];

export type CommandUser = Pick<User, 'id' | 'tag' | 'createdTimestamp' | 'displayAvatarURL' | 'username' | 'discriminator' | 'avatarURL' | 'bot'> & {
    send(options: MessageCreateOptions): Promise<unknown>;
    readonly flags: Pick<UserFlagsBitField, 'toArray'> | null;
};

export interface CommandMember {
    readonly user: CommandUser;
    readonly joinedAt: Date | null;
    readonly roles: {
        readonly cache: ReadonlyMap<string, { readonly id: string }>;
        readonly highest: { readonly id: string; readonly name: string };
    };
}

// Only the Discord capabilities consumed by commands belong here.
export interface CommandInteraction {
    readonly commandName: string;
    readonly client: {
        readonly ws: { readonly ping: number };
        readonly user: (Pick<User, 'username' | 'createdAt' | 'displayAvatarURL'> & { readonly id?: string }) | null;
        readonly emojis: { readonly cache: ReadonlyMap<string, { toString(): string }> };
        readonly guilds: { readonly cache: { readonly size: number } };
        readonly users: { readonly cache: { readonly size: number } };
    };
    readonly user: CommandUser;
    readonly options: {
        getInteger?(name: string): number | null;
        getSubcommand(): string;
        getChannel(name: string): { readonly id: string; readonly type: ChannelType } | null;
        getRole(name: string): { readonly id: string } | null;
        getString(name: string): string | null;
        getUser(name: string): CommandUser | null;
    };
    readonly guild: CommandGuild | null;
    readonly channel?: ModerationChannel | null;
    deferReply?(options?: InteractionDeferReplyOptions): Promise<unknown>;
    readonly deferred: boolean;
    readonly replied: boolean;
    reply(options: InteractionReplyOptions): Promise<unknown>;
    editReply(options: InteractionEditReplyOptions): Promise<unknown>;
    followUp(options: InteractionReplyOptions): Promise<unknown>;
}

export type CommandGuild = Pick<Guild,
    'id' | 'name' | 'createdTimestamp' | 'joinedTimestamp' | 'available' | 'large' |
    'maximumMembers' | 'maximumPresences' | 'memberCount' | 'partnered' |
    'premiumSubscriptionCount' | 'premiumTier' | 'verified' | 'afkChannelId' |
    'afkTimeout' | 'bannerURL' | 'defaultMessageNotifications' | 'description' |
    'explicitContentFilter' | 'iconURL' | 'mfaLevel' | 'nameAcronym' | 'ownerId' |
    'preferredLocale' | 'rulesChannelId' | 'shardId' | 'splashURL' | 'systemChannelId' |
    'publicUpdatesChannelId' | 'vanityURLCode' | 'verificationLevel'
> & {
    readonly members: {
        readonly cache: ReadonlyMap<string, CommandMember>;
        fetch(id: string): Promise<{ readonly permissions: Pick<PermissionsBitField, 'has'> } | null>;
        unban?(id: string): Promise<unknown>;
    };
    readonly channels?: { readonly cache: ReadonlyMap<string, ModerationChannel> };
};

export type GetModerationMember = (guildId: string, userId: string) => Promise<ModerationMember | null>;

export interface CommandMetadata {
    readonly category: CommandCategory;
    readonly data: { toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody };
}

export interface HttpTransport {
    get(url: string): Promise<unknown>;
}

export interface CommandContext {
    readonly commands: readonly CommandMetadata[];
    readonly database?: () => ModerationDatabase;
    readonly schedule?: ModerationSchedule;
    readonly getModerationMember?: GetModerationMember;
    readonly reportError?: (error: unknown) => void;
    readonly persistence?: Persistence;
    readonly getGuildInformation?: GetGuildInformation | undefined;
    readonly getDatabase?: () => SettingsDatabase;
    readonly http?: HttpTransport;
    readonly weatherApi?: string | undefined;
}

export interface Command extends CommandMetadata {
    execute(interaction: CommandInteraction, context: CommandContext): Promise<void>;
}

// Event names match Discord. Non-chat-input interactions carry no command.
export interface EventArguments {
    clientReady: [client?: ReadyClient];
    guildCreate: [guild: GuildState];
    guildDelete: [guild: GuildState];
    guildUnavailable: [guild: GuildState];
    guildUpdate: [oldGuild: GuildState, newGuild: GuildState];
    guildMemberAdd: [member: MemberState];
    guildMemberRemove: [member: RemovedMember];
    guildMemberUpdate: [oldMember: RemovedMember, newMember: MemberState];
    messageCreate: [message: MessageState];
    interactionCreate: [interaction: CommandInteraction | null];
}

export interface EventDefinition<Name extends keyof EventArguments> {
    readonly name: Name;
    readonly once: boolean;
    execute(...args: EventArguments[Name]): Promise<void>;
}

export type RegisteredEvent = {
    [Name in keyof EventArguments]: EventDefinition<Name>;
}[keyof EventArguments];

export interface Gateway {
    getModerationMember?: GetModerationMember;
    sendLog?: SendLog;
    getGuildInformation?: GetGuildInformation;
    subscribe(event: RegisteredEvent, reportError: (error: unknown) => void): void;
    login(token: string): Promise<unknown>;
    destroy(): Promise<void>;
}

export type GatewayFactory = (options: ClientOptions) => Gateway;

export interface RegistrationTransport {
    put(route: `/${string}`, options: {
        body: readonly RESTPostAPIChatInputApplicationCommandsJSONBody[];
    }): Promise<unknown>;
}

export type RestFactory = (options: { version: '10'; token: string }) => RegistrationTransport;
