import { createPersistence } from './persistence.mjs';
import type { Persistence } from './persistence.mjs';
import { createDatabase } from './database.mjs';
import type { SettingsDatabase } from './settings-database.mjs';
import { GatewayIntentBits, Partials, REST, Routes } from 'discord.js';
import { readRegistrationConfig, readStartupConfig } from './configuration.mjs';
import type { Environment } from './configuration.mjs';
import type { Command, HttpTransport, Gateway, GatewayFactory, RestFactory } from './contracts.mjs';
import { createDiscordGateway } from './discord.mjs';
import { commands, createEvents } from './registry.mjs';

export async function startBot({
    database,
    env = process.env,
    createGateway = createDiscordGateway,
    commandRegistry = commands,
    http,
    persistence,
    reportError = console.error,
    reportReady = () => { console.log('Bot has successfully signed in and is listening to events'); },
}: {
    database?: SettingsDatabase;
    http?: HttpTransport;
    persistence?: Persistence;
    env?: Environment;
    createGateway?: GatewayFactory;
    commandRegistry?: readonly Command[];
    reportError?: (error: unknown) => void;
    reportReady?: () => void;
} = {}): Promise<Gateway> {
    const config = readStartupConfig(env);
    const gateway = createGateway({
        intents: [
            GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildExpressions,
            GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks,
            GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping,
            GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessageReactions,
            GatewayIntentBits.DirectMessageTyping,
        ],
        partials: [Partials.Message, Partials.Channel, Partials.Reaction],
        allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
    });
    let ownedDatabase: ReturnType<typeof createDatabase> | undefined;
    const getOwnedDatabase = (): ReturnType<typeof createDatabase> => ownedDatabase ??= createDatabase(config);
    for (const event of createEvents({
        commandRegistry, reportReady, reportError, http, weatherApi: config.weatherApi,
        getDatabase: () => database ?? getOwnedDatabase(),
        persistence: persistence ?? createPersistence(getOwnedDatabase),
        sendLog: gateway.sendLog, getGuildInformation: gateway.getGuildInformation,
        logGuildId: config.guildId, logChannelId: config.channelId,
    })) {
        gateway.subscribe(event, reportError);
    }
    try {
        await gateway.login(config.token);
    } catch (error) {
        await gateway.destroy();
        throw error;
    }
    return gateway;
}

export async function registerCommands({
    env = process.env,
    createRest = ({ version, token }) => new REST({ version }).setToken(token),
    commandRegistry = commands,
}: { env?: Environment; createRest?: RestFactory; commandRegistry?: readonly Command[] } = {}): Promise<void> {
    const config = readRegistrationConfig(env);
    const rest = createRest({ version: '10', token: config.token });
    const route = config.environment === 'development'
        ? Routes.applicationGuildCommands(config.clientId, config.guildId)
        : Routes.applicationCommands(config.clientId);
    await rest.put(route, { body: commandRegistry.map(command => command.data.toJSON()) });
}
