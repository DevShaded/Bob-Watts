import type {
    ClientOptions,
    InteractionEditReplyOptions,
    InteractionReplyOptions,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

export type CommandCategory = 'Fun' | 'Moderation' | 'Public' | 'Settings' | 'Information';

export const commandCategories: readonly CommandCategory[] = [
    'Fun', 'Moderation', 'Public', 'Settings', 'Information',
];

// Only the Discord capabilities consumed by the migrated commands belong here.
// Extend this boundary as subsequent behavior slices join the registry.
export interface CommandInteraction {
    readonly commandName: string;
    readonly client: {
        readonly ws: { readonly ping: number };
        readonly user: { readonly username: string } | null;
    };
    readonly deferred: boolean;
    readonly replied: boolean;
    reply(options: InteractionReplyOptions): Promise<unknown>;
    editReply(options: InteractionEditReplyOptions): Promise<unknown>;
    followUp(options: InteractionReplyOptions): Promise<unknown>;
}

export interface Command {
    readonly category: CommandCategory;
    readonly data: { toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody };
    execute(interaction: CommandInteraction): Promise<void>;
}

// Event names match Discord. Non-chat-input interactions carry no command.
export interface EventArguments {
    clientReady: [];
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
