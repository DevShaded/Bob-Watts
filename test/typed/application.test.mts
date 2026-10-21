import assert from 'node:assert/strict';
import { test } from 'node:test';
import { IntentsBitField, MessageFlags, Partials } from 'discord.js';
import type { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { registerCommands, startBot } from '../../src/application.mjs';
import type { RegistrationTransport } from '../../src/contracts.mjs';
import { OfflineGateway, OfflineInteraction, startupEnvironment } from './discord.mjs';
import { informationDefinitions } from './fixtures/information-definitions.mjs';
import { publicDefinitions } from './fixtures/public-definitions.mjs';

await test('typed registration repeatedly sends all migrated definitions to guild and global API v10 routes', async () => {
    const requests: { route: string; body: readonly RESTPostAPIChatInputApplicationCommandsJSONBody[] }[] = [];
    const transport: RegistrationTransport = {
        put: (route, options) => {
            requests.push({ route, body: options.body });
            return Promise.resolve();
        },
    };
    for (const environment of ['development', 'production', 'development', 'production']) {
        await registerCommands({
            env: {
                APP_ENV: environment, APP_TOKEN: 'offline-token', APP_CLIENT_ID: '123',
                ...(environment === 'development' ? { APP_GUILD_ID: '456' } : {}),
            },
            createRest: options => {
                assert.deepEqual(options, { version: '10', token: 'offline-token' });
                return transport;
            },
        });
    }
    assert.deepEqual(requests.map(request => request.route), [
        '/applications/123/guilds/456/commands', '/applications/123/commands',
        '/applications/123/guilds/456/commands', '/applications/123/commands',
    ]);
    for (const request of requests) {
        const names = request.body.map(definition => definition.name);
        assert.deepEqual(names.slice().sort(), [
            '8ball', 'botinfo', 'coinflip', 'cookie', 'diceroll', 'help',
            'hug', 'kiss', 'ping', 'randomcat', 'randomdog', 'rps', 'slap', 'userinfo', 'weather',
        ]);
        assert.equal(new Set(names).size, 15);
        // Discord omits undefined optional fields when sending JSON.
        const serialized: unknown = JSON.parse(JSON.stringify(request.body));
        assert.deepEqual(serialized, [...publicDefinitions, ...informationDefinitions]);
    }
});

await test('compiled startup dispatches ping repeatedly with the established latency payloads', async () => {
    const gateway = new OfflineGateway();
    const errors: unknown[] = [];
    let readyCount = 0;
    const bot = await startBot({
        env: startupEnvironment,
        createGateway: options => {
            assert.ok(new IntentsBitField(options.intents).equals([
                'Guilds', 'GuildMembers', 'GuildModeration', 'GuildExpressions',
                'GuildIntegrations', 'GuildWebhooks', 'GuildInvites', 'GuildVoiceStates',
                'GuildPresences', 'GuildMessages', 'GuildMessageReactions', 'GuildMessageTyping',
                'MessageContent', 'DirectMessageReactions', 'DirectMessageTyping',
            ]));
            assert.deepEqual(options.partials, [Partials.Message, Partials.Channel, Partials.Reaction]);
            assert.deepEqual(options.allowedMentions, { parse: ['users', 'roles'], repliedUser: true });
            return gateway;
        },
        reportError: error => { errors.push(error); },
        reportReady: () => { readyCount++; },
    });
    assert.equal(bot, gateway);
    assert.deepEqual(gateway.tokens, ['offline-token']);
    await gateway.ready();
    await gateway.ready();
    assert.equal(readyCount, 1);

    for (const [latency, color, description] of [
        [42, 0x28a745, '🏓 Pong - 42 milliseconds.'],
        [450, 0x28a745, '🏓 Pong - 450 milliseconds.'],
        [450.9, 0xFF6000, '🏓 Pong - 450 milliseconds.'],
        [600, 0xFF6000, '🏓 Pong - 600 milliseconds.'],
        [749.9, 0xFF6000, '🏓 Pong - 749 milliseconds.'],
        [750, 0xdc3545, '🏓 Pong - 750 milliseconds.'],
        [900, 0xdc3545, '🏓 Pong - 900 milliseconds.'],
    ] satisfies [number, number, string][]) {
        const interaction = new OfflineInteraction();
        interaction.client.ws.ping = latency;
        await gateway.dispatch(interaction);
        assert.partialDeepStrictEqual(interaction.responses, [{
            method: 'reply', payload: { embeds: [{ color, description, footer: { text: 'Test bot' } }] },
        }]);
        const response = interaction.responses[0];
        assert.ok(response);
        const embed = response.payload.embeds?.[0];
        assert.ok(embed && !('toJSON' in embed));
        assert.ok(embed.timestamp);
        assert.equal(new Date(embed.timestamp).toISOString(), embed.timestamp);
    }
    assert.deepEqual(errors, []);
});

await test('dispatch ignores non-command and unknown interactions', async () => {
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, createGateway: () => gateway });
    await gateway.dispatch(null);
    const interaction = new OfflineInteraction();
    interaction.commandName = 'unknown';
    await gateway.dispatch(interaction);
    assert.deepEqual(interaction.responses, []);
});

await test('ping reports unavailable gateway latency until a valid heartbeat measurement arrives', async () => {
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, createGateway: () => gateway });
    for (const latency of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
        const interaction = new OfflineInteraction();
        interaction.client.ws.ping = latency;
        await gateway.dispatch(interaction);
        assert.partialDeepStrictEqual(interaction.responses, [{
            method: 'reply', payload: { embeds: [{
                color: 0xffc107,
                description: '🏓 Pong - gateway latency is not available yet.',
            }] },
        }]);
    }
    const interaction = new OfflineInteraction();
    interaction.client.ws.ping = 100;
    await gateway.dispatch(interaction);
    assert.partialDeepStrictEqual(interaction.responses, [{
        method: 'reply', payload: { embeds: [{ color: 0x28a745, description: '🏓 Pong - 100 milliseconds.' }] },
    }]);
});

await test('command failures use reply, editReply or followUp according to the response lifecycle', async () => {
    const gateway = new OfflineGateway();
    const errors: unknown[] = [];
    await startBot({
        env: startupEnvironment, createGateway: () => gateway,
        reportError: error => { errors.push(error); },
    });
    const failure = new Error('Discord rejected the command response');
    for (const [deferred, replied, method] of [
        [false, false, 'reply'], [true, false, 'editReply'],
        [false, true, 'followUp'], [true, true, 'followUp'],
    ] satisfies [boolean, boolean, string][]) {
        const interaction = new OfflineInteraction();
        interaction.deferred = deferred;
        interaction.replied = replied;
        interaction.replyFailure = failure;
        await gateway.dispatch(interaction);
        assert.deepEqual(interaction.responses, [{
            method,
            payload: {
                content: 'Well that didn\'t work, try another command maybe?',
                ...(method === 'editReply' ? {} : { flags: MessageFlags.Ephemeral }),
            },
        }]);
    }
    assert.deepEqual(errors, [failure, failure, failure, failure]);
});

await test('entrypoints validate only their required configuration before constructing external clients', async () => {
    const unexpected = (): never => { throw new Error('Client constructed before validation'); };
    await assert.rejects(registerCommands({ env: {}, createRest: unexpected }), /Set APP_ENV/);
    await assert.rejects(registerCommands({
        env: { APP_ENV: 'production', APP_TOKEN: ' ' }, createRest: unexpected,
    }), /Missing .env values: APP_TOKEN, APP_CLIENT_ID/);
    await assert.rejects(registerCommands({
        env: { APP_ENV: 'development', APP_TOKEN: 'token', APP_CLIENT_ID: '123' },
        createRest: unexpected,
    }), /Missing .env values: APP_GUILD_ID/);

    for (const key of ['APP_TOKEN', 'DATABASE_URL', 'APP_GUILD_ID', 'APP_CHANNEL_ID']) {
        await assert.rejects(startBot({
            env: { ...startupEnvironment, [key]: ' ' }, createGateway: unexpected,
        }), new RegExp(`Missing .env values: ${key}`));
    }
    await assert.rejects(startBot({ env: {}, createGateway: unexpected }), /Set APP_ENV/);

    // No application ID or optional weather key is needed to start the bot.
    for (const environment of ['development', 'production']) {
        const gateway = new OfflineGateway();
        await startBot({
            env: { ...startupEnvironment, APP_ENV: environment }, createGateway: () => gateway,
        });
        const interaction = new OfflineInteraction();
        await gateway.dispatch(interaction);
        assert.equal(interaction.responses.length, 1);
        assert.deepEqual(gateway.tokens, ['offline-token']);
    }
});

await test('entrypoints propagate Discord failures and release a client after failed login', async () => {
    const failure = new Error('Offline Discord failure');
    const fail = (): Promise<never> => Promise.reject(failure);
    await assert.rejects(registerCommands({
        env: { APP_ENV: 'production', APP_TOKEN: 'token', APP_CLIENT_ID: '123' },
        createRest: () => ({ put: fail }),
    }), error => error === failure);
    const gateway = new OfflineGateway();
    gateway.login = fail;
    await assert.rejects(startBot({
        env: startupEnvironment, createGateway: () => gateway,
    }), error => error === failure);
    assert.equal(gateway.destroyed, true);
});
