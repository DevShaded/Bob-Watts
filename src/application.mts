import { createDatabase } from './database.mjs';
import type { ModerationDatabase, ModerationSchedule } from './moderation-contracts.mjs';
import { GatewayIntentBits, Partials, REST, Routes } from 'discord.js';
import { readRegistrationConfig, readStartupConfig } from './configuration.mjs';
import type { DatabaseConfig, Environment } from './configuration.mjs';
import type { Command, Gateway, GatewayFactory, RestFactory } from './contracts.mjs';
import { createDiscordGateway } from './discord.mjs';
import { commands, createEvents } from './registry.mjs';

export async function startBot({
    env = process.env,
    createGateway = createDiscordGateway,
    createCommandDatabase = createDatabase,
    schedule,
    commandRegistry = commands,
    reportError = console.error,
    reportReady = () => { console.log('Bot has successfully signed in and is listening to events'); },
}: {
    env?: Environment;
    createGateway?: GatewayFactory;
    createCommandDatabase?: (config: DatabaseConfig) => ModerationDatabase;
    schedule?: ModerationSchedule;
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
    let database: ModerationDatabase | undefined;
    const destroyGateway = gateway.destroy.bind(gateway);
    gateway.destroy = async () => {
        try {
            await destroyGateway();
        } finally {
            const activeDatabase = database;
            database = undefined;
            await activeDatabase?.$disconnect?.();
        }
    };
    const context = {
        database: (): ModerationDatabase => { database ??= createCommandDatabase(config); return database; },
        reportError,
        ...(schedule ? { schedule } : {}),
    };
    for (const event of createEvents({ commandRegistry, reportReady, reportError, context })) {
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
