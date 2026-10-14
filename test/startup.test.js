'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { setImmediate } = require('node:timers/promises');
const { Client, Events, ActivityType, GatewayIntentBits, Partials, REST, MessageFlags } = require('discord.js');
const { startBot } = require('../index');
const { registerCommands } = require('../createapplicationcommands');

const commandsByCategory = {
    Fun: ['8ball', 'coinflip', 'cookie', 'diceroll', 'hug', 'kiss', 'rps', 'slap'],
    Information: ['randomcat', 'randomdog', 'weather'],
    Moderation: ['ban', 'clean', 'clearinfractions', 'infractions', 'kick', 'mute', 'unban', 'unmute', 'vckick', 'warn'],
    Public: ['botinfo', 'help', 'ping', 'serverinfo', 'userinfo'],
    Settings: ['add', 'delete', 'remove', 'set'],
};
const commandNames = Object.values(commandsByCategory).flat().sort();

// Never log in or register commands against a real Discord application.
Object.assign(process.env, {
    APP_ENV: 'development', APP_TOKEN: 'test-token',
    APP_CLIENT_ID: '123456789012345678', APP_GUILD_ID: '234567890123456789',
    DATABASE_URL: 'mysql://test:test@127.0.0.1:1/bobwatts_test',
});

test('the bot starts with v14 intents and handles ready and interaction events', async t => {
    t.mock.method(console, 'log', () => {});
    t.mock.method(console, 'error', () => {});
    const login = t.mock.method(Client.prototype, 'login', async () => 'test-token');
    const client = await startBot();
    t.after(() => client.destroy());
    assert.deepEqual(login.mock.calls[0].arguments, ['test-token']);

    assert.deepEqual([...client.commands.keys()].sort(), commandNames);
    assert.ok(client.options.intents.equals([
        'Guilds', 'GuildMembers', 'GuildModeration', 'GuildExpressions', 'GuildIntegrations',
        'GuildWebhooks', 'GuildInvites', 'GuildVoiceStates', 'GuildPresences', 'GuildMessages',
        'GuildMessageReactions', 'GuildMessageTyping', 'MessageContent',
        'DirectMessageReactions', 'DirectMessageTyping',
    ].map(name => GatewayIntentBits[name])));
    assert.deepEqual(client.options.partials, [Partials.Message, Partials.Channel, Partials.Reaction]);
    assert.deepEqual(client.options.allowedMentions, { parse: ['users', 'roles'], repliedUser: true });
    assert.equal(client.listenerCount(Events.ClientReady), 1);
    for (const event of [
        Events.GuildCreate, Events.GuildDelete, Events.GuildUnavailable, Events.GuildUpdate,
        Events.GuildMemberAdd, Events.GuildMemberRemove, Events.GuildMemberUpdate,
        Events.InteractionCreate, Events.MessageCreate,
    ]) {
        assert.equal(client.listenerCount(event), 1, event);
    }

    const prisma = require('../App/Database');
    const original = prisma.bot.findMany;
    prisma.bot.findMany = async () => [{ name: 'Test activity', type: 'WATCHING', url: null }];
    t.after(() => { prisma.bot.findMany = original; });
    const activity = t.mock.fn();
    client.user = { username: 'Test bot', setActivity: activity };
    client.emit(Events.ClientReady, client);
    await setImmediate();
    client.emit(Events.ClientReady, client);
    await setImmediate();
    assert.equal(activity.mock.callCount(), 1);
    assert.deepEqual(activity.mock.calls[0].arguments, ['Test activity', { type: ActivityType.Watching, url: undefined }]);

    const handler = client.listeners(Events.InteractionCreate)[0];
    const reply = t.mock.fn(async () => {});
    await handler({ isChatInputCommand: () => true, commandName: 'ping', client, reply });
    assert.equal(reply.mock.callCount(), 1);
    assert.match(reply.mock.calls[0].arguments[0].embeds[0].description, /Pong/);
    await handler({ isChatInputCommand: () => false, commandName: 'ping', client, reply });
    await handler({ isChatInputCommand: () => true, commandName: 'unknown', client, reply });
    assert.equal(reply.mock.callCount(), 1);

    for (const [deferred, replied, expected] of [
        [false, false, 'reply'], [true, false, 'editReply'],
        [false, true, 'followUp'], [true, true, 'followUp'],
    ]) {
        const calls = [];
        let attempted = false;
        const interaction = {
            isChatInputCommand: () => true, inGuild: () => true,
            commandName: 'ping', client, deferred, replied,
            reply: async payload => {
                if (!attempted) {
                    attempted = true;
                    throw new Error('Discord rejected the command response');
                }
                calls.push(['reply', payload]);
            },
            editReply: async payload => calls.push(['editReply', payload]),
            followUp: async payload => calls.push(['followUp', payload]),
        };
        await handler(interaction);
        assert.equal(calls.length, 1);
        assert.equal(calls[0][0], expected);
        assert.deepEqual(calls[0][1], {
            content: 'Well that didn\'t work, try another command maybe?',
            ...(expected === 'editReply' ? {} : { flags: MessageFlags.Ephemeral }),
        });
    }
});

test('startup can be repeated and uses the default activity when none is stored', async t => {
    t.mock.method(console, 'log', () => {});
    const login = t.mock.method(Client.prototype, 'login', async () => 'test-token');
    const prisma = require('../App/Database');
    const original = prisma.bot.findMany;
    prisma.bot.findMany = async () => [];
    t.after(() => { prisma.bot.findMany = original; });
    const clients = [];

    for (let attempt = 0; attempt < 2; attempt++) {
        const client = await startBot();
        t.after(() => client.destroy());
        clients.push(client);
        const activity = t.mock.fn();
        client.user = { setActivity: activity };
        client.emit(Events.ClientReady, client);
        await setImmediate();
        assert.equal(activity.mock.callCount(), 1);
        assert.deepEqual(activity.mock.calls[0].arguments, [
            'devshaded.com/bobwatts', { type: ActivityType.Watching },
        ]);
        assert.deepEqual([...client.commands.keys()].sort(), commandNames);
        assert.equal(client.listenerCount(Events.InteractionCreate), 1);
    }
    assert.notEqual(clients[0], clients[1]);
    assert.equal(login.mock.callCount(), 2);
});

test('startup dispatches guild events and retains message help and ignored messages', async t => {
    t.mock.method(console, 'log', () => {});
    t.mock.method(Client.prototype, 'login', async () => 'test-token');
    const client = await startBot();
    t.after(() => client.destroy());
    client.user = { username: 'Test bot' };
    const send = t.mock.fn(async () => {});
    const logChannelId = '345678901234567890';
    const originalChannelId = process.env.APP_CHANNEL_ID;
    process.env.APP_CHANNEL_ID = logChannelId;
    t.after(() => {
        if (originalChannelId === undefined) delete process.env.APP_CHANNEL_ID;
        else process.env.APP_CHANNEL_ID = originalChannelId;
    });
    client.guilds.cache.set(process.env.APP_GUILD_ID, {
        channels: { cache: new Map([[logChannelId, { send }]]) },
    });
    const guildHandler = client.listeners(Events.GuildDelete)[0];
    await guildHandler({ name: 'Test guild', client });
    await guildHandler({ name: 'Another guild', client });
    assert.equal(send.mock.callCount(), 2);
    assert.equal(send.mock.calls[0].arguments[0].embeds[0].description, 'I have left **Test guild**');
    assert.equal(send.mock.calls[1].arguments[0].embeds[0].description, 'I have left **Another guild**');

    const messageHandler = client.listeners(Events.MessageCreate)[0];
    const reply = t.mock.fn(async () => {});
    await messageHandler({ author: { bot: true }, content: '!help', reply });
    await messageHandler({ author: { bot: false }, webhookId: 'webhook', content: '!help', reply });
    await messageHandler({ author: { bot: false }, content: 'hello', reply });
    assert.equal(reply.mock.callCount(), 0);
    await messageHandler({ author: { bot: false }, content: '!help', reply });
    assert.equal(reply.mock.callCount(), 1);
    const payload = reply.mock.calls[0].arguments[0];
    assert.equal(payload.embeds[0].title, 'Announcement');
    assert.equal(payload.embeds[0].footer.text, 'Test bot');
    assert.equal(payload.components[0].toJSON().components[0].url, 'https://devshaded.com/bobwatts');
});

test('registration repeatedly uses API v10 for guild and global commands without making requests', async t => {
    const requests = [];
    t.mock.method(console, 'log', () => {});
    t.mock.method(REST.prototype, 'put', async function (route, options) {
        requests.push({ version: this.options.version, route, body: options.body });
    });
    for (const environment of ['development', 'production', 'development', 'production']) {
        await registerCommands({
            APP_ENV: environment,
            APP_TOKEN: 'test-token',
            APP_CLIENT_ID: '123456789012345678',
            ...(environment === 'development' ? { APP_GUILD_ID: '234567890123456789' } : {}),
        });
    }
    assert.equal(requests.length, 4);
    const expectedPayloads = Object.entries(commandsByCategory)
        .flatMap(([category, names]) => names.map(name => require(`../Commands/${category}/${name}`).data.toJSON()));
    for (const request of requests) {
        assert.equal(request.version, '10');
        assert.deepEqual(request.body.map(command => command.name).sort(), commandNames);
        assert.deepEqual(request.body, expectedPayloads);
    }
    assert.equal(requests[0].route, '/applications/123456789012345678/guilds/234567890123456789/commands');
    assert.equal(requests[1].route, '/applications/123456789012345678/commands');
    assert.deepEqual(requests.slice(2), requests.slice(0, 2));
});

test('registration reports invalid configuration and request failures to its caller', async t => {
    t.mock.method(console, 'log', () => {});
    const failure = new Error('Discord rejected registration');
    const put = t.mock.method(REST.prototype, 'put', async () => { throw failure; });
    await assert.rejects(registerCommands({}), /Set APP_ENV to development or production/);
    await assert.rejects(registerCommands({ APP_ENV: 'production' }), /Missing .env values: APP_TOKEN, APP_CLIENT_ID/);
    await assert.rejects(registerCommands({
        APP_ENV: 'development', APP_TOKEN: 'test-token', APP_CLIENT_ID: '123456789012345678',
    }), /Missing .env values: APP_GUILD_ID/);
    assert.equal(put.mock.callCount(), 0);
    await assert.rejects(registerCommands({
        APP_ENV: 'production', APP_TOKEN: 'test-token', APP_CLIENT_ID: '123456789012345678',
    }), error => error === failure);
    assert.equal(put.mock.callCount(), 1);
});
