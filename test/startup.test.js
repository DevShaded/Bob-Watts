'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { setImmediate } = require('node:timers/promises');
const { Client, Events, ActivityType, GatewayIntentBits, Partials, REST, MessageFlags } = require('discord.js');

// Never log in or register commands against a real Discord application.
Object.assign(process.env, {
    APP_ENV: 'development', APP_TOKEN: 'test-token',
    APP_CLIENT_ID: '123456789012345678', APP_GUILD_ID: '234567890123456789',
    DATABASE_URL: 'mysql://test:test@127.0.0.1:1/bobwatts_test',
});

test('the bot starts with v14 intents and handles ready and interaction events', async t => {
    let client;
    t.mock.method(console, 'log', () => {});
    t.mock.method(console, 'error', () => {});
    t.mock.method(Client.prototype, 'login', async function () {
        client = this;
        return 'test-token';
    });
    require('../index');
    await setImmediate();
    t.after(() => client.destroy());

    assert.equal(client.commands.size, 30);
    assert.ok(client.options.intents.has(GatewayIntentBits.MessageContent));
    assert.ok(client.options.intents.has(GatewayIntentBits.GuildMembers));
    assert.ok(client.options.partials.includes(Partials.Message));
    assert.equal(client.listenerCount(Events.ClientReady), 1);

    const prisma = require('../App/Database');
    const original = prisma.bot.findMany;
    prisma.bot.findMany = async () => [{ name: 'Test activity', type: 'WATCHING', url: null }];
    t.after(() => { prisma.bot.findMany = original; });
    const activity = t.mock.fn();
    client.user = { setActivity: activity };
    await client.listeners(Events.ClientReady)[0]();
    assert.deepEqual(activity.mock.calls[0].arguments, ['Test activity', { type: ActivityType.Watching, url: undefined }]);

    client.commands.set('failure', { execute: async () => { throw new Error('Test failure'); } });
    const handler = client.listeners(Events.InteractionCreate)[0];
    for (const [deferred, replied, expected] of [[false, false, 'reply'], [true, false, 'editReply'], [false, true, 'followUp']]) {
        const calls = [];
        const interaction = {
            isChatInputCommand: () => true, inGuild: () => true,
            commandName: 'failure', deferred, replied,
            reply: async payload => calls.push(['reply', payload]),
            editReply: async payload => calls.push(['editReply', payload]),
            followUp: async payload => calls.push(['followUp', payload]),
        };
        await handler(interaction);
        assert.equal(calls.length, 1);
        assert.equal(calls[0][0], expected);
        if (expected !== 'editReply') assert.equal(calls[0][1].flags, MessageFlags.Ephemeral);
    }
    await handler({ isChatInputCommand: () => false });
});

test('registration uses API v10 for guild and global commands without making requests', async t => {
    const requests = [];
    t.mock.method(console, 'log', () => {});
    t.mock.method(REST.prototype, 'put', async function (route, options) {
        requests.push({ version: this.options.version, route, body: options.body });
    });
    for (const environment of ['development', 'production']) {
        process.env.APP_ENV = environment;
        delete require.cache[require.resolve('../createapplicationcommands')];
        require('../createapplicationcommands');
        await setImmediate();
    }
    assert.equal(requests.length, 2);
    for (const request of requests) {
        assert.equal(request.version, '10');
        assert.equal(request.body.length, 30);
        assert.ok(request.body.every(command => typeof command.name === 'string'));
    }
    assert.equal(requests[0].route, '/applications/123456789012345678/guilds/234567890123456789/commands');
    assert.equal(requests[1].route, '/applications/123456789012345678/commands');
});
