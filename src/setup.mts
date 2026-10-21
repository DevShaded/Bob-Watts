import assert from 'node:assert/strict';
import type { Prisma } from '@prisma/client';
import { createDatabase as createPrismaDatabase } from './database.mjs';
import { readSetupConfig } from './configuration.mjs';
import type { DatabaseConfig, Environment } from './configuration.mjs';
import { commands, createEvents } from './registry.mjs';
import { createPersistence } from './persistence.mjs';

export interface SetupDatabase {
    connect(): Promise<void>;
    queryModels(): Promise<number>;
    disconnect(): Promise<void>;
}

function createSetupDatabase(config: DatabaseConfig): SetupDatabase {
    const database = createPrismaDatabase(config);
    // Exhaustive against the generated schema: adding a model requires a probe.
    const queries = {
        Bot: () => database.bot.findFirst(),
        Users: () => database.users.findFirst(),
        Guilds: () => database.guilds.findFirst(),
        Channels: () => database.channels.findFirst(),
        Messages: () => database.messages.findFirst(),
        Infractions: () => database.infractions.findFirst(),
        Moderators: () => database.moderators.findFirst(),
        GuildSettings: () => database.guildSettings.findFirst(),
        GuildMembers: () => database.guildMembers.findFirst(),
        GuildLogs: () => database.guildLogs.findFirst(),
        GuildChannels: () => database.guildChannels.findFirst(),
        ThreadChannels: () => database.threadChannels.findFirst(),
        ChannelMessages: () => database.channelMessages.findFirst(),
        UserChannels: () => database.userChannels.findFirst(),
    } satisfies Record<Prisma.ModelName, () => Promise<unknown>>;
    return {
        connect: () => database.$connect(),
        disconnect: () => database.$disconnect(),
        async queryModels() {
            for (const query of Object.values(queries)) await query();
            return Object.keys(queries).length;
        },
    };
}

export async function checkSetup({
    env = process.env,
    createDatabase = createSetupDatabase,
    report = console.log,
}: {
    env?: Environment;
    createDatabase?: (config: DatabaseConfig) => SetupDatabase;
    report?: (message: string) => void;
} = {}): Promise<void> {
    assert.equal(process.versions.node.split('.')[0], '24', 'Use Node.js 24 (see .nvmrc).');
    const config = readSetupConfig(env);
    const names = new Set<string>();
    for (const command of commands) {
        const definition = command.data.toJSON();
        assert.ok(!names.has(definition.name), `Duplicate command: ${definition.name}`);
        names.add(definition.name);
    }
    report(`Loaded and validated ${String(names.size)} slash command definitions.`);
    // Event construction is pure; persistence is not used during validation.
    const events = createEvents({
        commandRegistry: commands,
        persistence: createPersistence(() => createPrismaDatabase(config)),
        reportReady: () => {}, reportError: error => { throw error; },
    });
    report(`Loaded ${String(events.length)} event handlers.`);
    const database = createDatabase(config);
    try {
        await database.connect();
        const modelCount = await database.queryModels();
        report(`Database connected; all ${String(modelCount)} models queried successfully.`);
        report(config.missingDiscordSettings.length
            ? `Local setup passed. Discord still needs these .env values: ${config.missingDiscordSettings.join(', ')}.`
            : 'Local setup passed. Discord settings are present; authentication is not checked here.');
    } finally {
        await database.disconnect();
    }
}
