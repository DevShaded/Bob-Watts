import type { ReadyClient, GuildState, MemberState, RemovedMember, MessageState, SendLog, GetGuildInformation } from './event-resources.mjs';
import type { Persistence } from './persistence.mjs';
import type {
    ClientOptions,
    InteractionEditReplyOptions,
    InteractionReplyOptions,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    User,
    UserFlagsBitField,
} from 'discord.js';

export type CommandCategory = 'Fun' | 'Moderation' | 'Public' | 'Settings' | 'Information';

export const commandCategories: readonly CommandCategory[] = [
    'Fun', 'Moderation', 'Public', 'Settings', 'Information',
];

export type CommandUser = Pick<User, 'id' | 'tag' | 'createdTimestamp' | 'displayAvatarURL'> & {
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

// Only the Discord capabilities consumed by the migrated commands belong here.
// Extend this boundary as subsequent behavior slices join the registry.
export interface CommandInteraction {
    readonly commandName: string;
    readonly client: {
        readonly ws: { readonly ping: number };
        readonly user: Pick<User, 'username' | 'createdAt' | 'displayAvatarURL'> | null;
        readonly emojis: { readonly cache: ReadonlyMap<string, { toString(): string }> };
        readonly guilds: { readonly cache: { readonly size: number } };
        readonly users: { readonly cache: { readonly size: number } };
    };
    readonly user: CommandUser;
    readonly options: {
        getString(name: string): string | null;
        getUser(name: string): CommandUser | null;
    };
    readonly guild: {
        readonly id: string;
        readonly members: { readonly cache: ReadonlyMap<string, CommandMember> };
    } | null;
    readonly deferred: boolean;
    readonly replied: boolean;
    reply(options: InteractionReplyOptions): Promise<unknown>;
    editReply(options: InteractionEditReplyOptions): Promise<unknown>;
    followUp(options: InteractionReplyOptions): Promise<unknown>;
}

export interface CommandMetadata {
    readonly category: CommandCategory;
    readonly data: { toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody };
}

export interface HttpTransport {
    get(url: string): Promise<unknown>;
}

export interface CommandContext {
    readonly commands: readonly CommandMetadata[];
    readonly persistence?: Persistence;
    readonly getGuildInformation?: GetGuildInformation | undefined;
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
