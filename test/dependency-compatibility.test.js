'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { Collection, EmbedBuilder, MessageFlags, PermissionsBitField, UserFlagsBitField } = require('discord.js');
const axios = require('axios');

// These tests stub every database call and HTTP request; no credentials needed.
process.env.DATABASE_URL = 'mysql://test:test@127.0.0.1:1/bobwatts_test';
const prisma = require('../App/Database');

function stubDatabase(t, model, method, implementation) {
    // Prisma delegates are proxies without method property descriptors.
    const original = model[method];
    const replacement = t.mock.fn(implementation);
    model[method] = replacement;
    t.after(() => { model[method] = original; });
    return replacement;
}

function commands() {
    return fs.readdirSync(path.join(__dirname, '../Commands'), { recursive: true })
        .filter(file => file.endsWith('.js'))
        .map(file => require(path.join(__dirname, '../Commands', file)));
}

function interaction() {
    const replies = [];
    const user = {
        id: '123456789012345678', username: 'Test user', tag: 'Test user',
        createdAt: new Date('2020-01-01'), createdTimestamp: Date.UTC(2020, 0, 1),
        displayAvatarURL: () => 'https://example.com/avatar.png',
        flags: new UserFlagsBitField(['Staff', 'VerifiedDeveloper']),
    };
    return {
        replies, user,
        client: {
            user, ws: { ping: 42 },
            emojis: { cache: new Collection() },
            guilds: { cache: new Collection() }, users: { cache: new Collection() },
        },
        guild: {
            id: '234567890123456789',
            members: { fetch: async () => ({ permissions: new PermissionsBitField() }) },
        },
        options: {
            getString: name => ({ tool: 'rock', message: 'Will this work?', units: 'metric', location: 'London' })[name],
            getUser: () => user,
        },
        reply: async payload => { replies.push(payload); },
    };
}

function validateReply(payload) {
    for (const embed of payload.embeds ?? []) {
        const builder = new EmbedBuilder();
        if (embed.color !== undefined) {
            assert.equal(typeof embed.color, 'number', 'Raw API embed colors must be numbers');
            builder.setColor(embed.color);
        }
        if (embed.timestamp !== undefined) {
            assert.equal(typeof embed.timestamp, 'string');
            assert.equal(new Date(embed.timestamp).toISOString(), embed.timestamp);
        }
        if (embed.title) builder.setTitle(embed.title);
        if (embed.description) builder.setDescription(embed.description);
        if (embed.fields) builder.addFields(embed.fields);
        if (embed.image) builder.setImage(embed.image.url);
        if (embed.thumbnail) builder.setThumbnail(embed.thumbnail.url);
        if (embed.author) builder.setAuthor({ name: embed.author.name, iconURL: embed.author.icon_url });
        if (embed.footer) builder.setFooter({ text: embed.footer.text, iconURL: embed.footer.icon_url });
    }
    for (const row of payload.components ?? []) {
        const json = row.toJSON();
        assert.equal(json.type, 1);
        for (const button of json.components) {
            assert.equal(button.type, 2);
            assert.equal(button.style, 5);
            assert.ok(new URL(button.url));
        }
    }
    assert.equal(payload.ephemeral, undefined, 'Use MessageFlags for private replies');
}

test('all slash commands serialize with the current builders', () => {
    const loaded = commands();
    assert.equal(loaded.length, 30);
    assert.equal(new Set(loaded.map(command => command.name)).size, loaded.length);
    for (const command of loaded) {
        assert.equal(command.data.toJSON().name, command.name);
        assert.equal(typeof command.execute, 'function');
    }
    const days = loaded.find(command => command.name === 'ban').data.toJSON().options.find(option => option.name === 'days');
    assert.equal(days.choices.find(choice => choice.name === '0 Days').value, 0);
});

test('fun commands, help and botinfo produce v14 payloads without PM2', async () => {
    for (const command of commands().filter(command =>
        ['8ball', 'coinflip', 'cookie', 'diceroll', 'hug', 'kiss', 'rps', 'slap', 'help', 'botinfo'].includes(command.name))) {
        const input = interaction();
        await command.execute(input);
        assert.equal(input.replies.length, 1, command.name);
        validateReply(input.replies[0]);
    }
});

test('ping uses numeric colors at every latency level', async () => {
    for (const latency of [42, 600, 900]) {
        const input = interaction();
        input.client.ws.ping = latency;
        await require('../Commands/Public/ping').execute(input);
        validateReply(input.replies[0]);
    }
});

test('userinfo recognizes v14 badge names', async () => {
    const input = interaction();
    input.guild.members.cache = new Collection([[input.user.id, {
        user: input.user, joinedAt: new Date('2021-01-01'),
        roles: { cache: new Collection(), highest: { id: input.guild.id } },
    }]]);
    await require('../Commands/Public/userinfo').execute(input);
    validateReply(input.replies[0]);
    assert.match(input.replies[0].embeds[0].fields.find(field => field.name === 'Badge(s)').value, /Staff, VerifiedDeveloper/);
});

test('HTTP commands work with the current Axios response format', async t => {
    const original = axios.defaults.adapter;
    t.after(() => { axios.defaults.adapter = original; });
    for (const [name, data] of [
        ['randomcat', [{ url: 'https://example.com/cat.png' }]],
        ['randomdog', { message: 'https://example.com/dog.png' }],
        ['weather', {
            name: 'London', id: 123, weather: [{ icon: '01d', description: 'clear' }],
            sys: { country: 'GB', sunrise: 1700000000, sunset: 1700050000 },
            main: { feels_like: 20, temp: 21 }, clouds: { all: 0 }, wind: { speed: 2 },
        }],
    ]) {
        axios.defaults.adapter = async config => ({ data, status: 200, statusText: 'OK', headers: {}, config });
        const input = interaction();
        await require(`../Commands/Information/${name}`).execute(input);
        assert.equal(input.replies.length, 1, name);
        validateReply(input.replies[0]);
    }
});

test('moderation and settings deny members without permissions using private replies', async t => {
    stubDatabase(t, prisma.moderators, 'findFirst', async () => null);
    stubDatabase(t, prisma.users, 'findUnique', async () => ({ accountId: '123456789012345678' }));
    for (const category of ['Moderation', 'Settings']) {
        for (const file of fs.readdirSync(path.join(__dirname, '../Commands', category))) {
            const input = interaction();
            await require(`../Commands/${category}/${file}`).execute(input);
            assert.equal(input.replies.length, 1, file);
            assert.equal(input.replies[0].flags, MessageFlags.Ephemeral, file);
        }
    }
});

test('bans convert history days to seconds, including zero, with and without logging', async t => {
    const Moderation = require('../App/Commands/Moderation');
    const create = stubDatabase(t, prisma.infractions, 'create', async () => ({}));
    let logging;
    stubDatabase(t, prisma.guildLogs, 'findUnique', async () => logging ? { infractions_log: 'log' } : null);
    for (logging of [false, true]) {
        for (const days of [0, 1, 7]) {
            const input = interaction();
            const sent = [];
            input.options.getInteger = () => days;
            input.options.getString = () => 'Test reason';
            input.guild.channels = { cache: new Collection([['log', { send: async payload => sent.push(payload) }]]) };
            const ban = t.mock.fn(async () => {});
            await new Moderation(input, 'ban').ban({
                id: input.user.id, user: input.user, joinedAt: new Date('2021-01-01'),
                displayAvatarURL: input.user.displayAvatarURL, ban,
            });
            assert.equal(ban.mock.callCount(), 1);
            assert.deepEqual(ban.mock.calls[0].arguments[0], { reason: 'Test reason', deleteMessageSeconds: days * 86400 });
            assert.equal(input.replies.length, 1);
            for (const payload of [...input.replies, ...sent]) validateReply(payload);
        }
    }
    assert.equal(create.mock.callCount(), 6);
});

test('guild and channel writes preserve existing database enum strings', async t => {
    const create = stubDatabase(t, prisma.guilds, 'create', async () => ({}));
    const update = stubDatabase(t, prisma.guilds, 'update', async () => ({}));
    const settings = stubDatabase(t, prisma.guildSettings, 'update', async () => ({}));
    const channel = stubDatabase(t, prisma.channels, 'create', async () => ({}));
    const thread = stubDatabase(t, prisma.threadChannels, 'create', async () => ({}));
    const guild = {
        id: '123', premiumTier: 2, defaultMessageNotifications: 1,
        explicitContentFilter: 2, mfaLevel: 1, verificationLevel: 4,
        createdTimestamp: Date.UTC(2020, 0, 1), joinedTimestamp: Date.UTC(2021, 0, 1),
        iconURL: () => null, bannerURL: () => null, splashURL: () => null,
    };
    const Guild = require('../App/Discord/Guild');
    const Message = require('../App/Discord/Message');
    for (const model of [new Guild(guild), new Message({ guild })]) {
        await model.createGuild();
        await model.updateGuild();
    }
    for (const call of create.mock.calls) {
        assert.equal(call.arguments[0].data.premiumTier, 'TIER_2');
        assert.equal(call.arguments[0].data.GuildSettings.create.verificationLevel, 'VERY_HIGH');
    }
    for (const call of update.mock.calls) assert.equal(call.arguments[0].data.premiumTier, 'TIER_2');
    for (const call of settings.mock.calls) {
        assert.equal(call.arguments[0].data.defaultMessageNotifications, 'ONLY_MENTIONS');
        assert.equal(call.arguments[0].data.explicitContentFilter, 'ALL_MEMBERS');
        assert.equal(call.arguments[0].data.mfaLevel, 'ELEVATED');
    }
    await new Message({ guild, channel: { id: '234', type: 0 } }).createChannel();
    await new Message({ guild, channel: { id: '345', type: 11 } }).createThreadChannel();
    assert.equal(channel.mock.calls[0].arguments[0].data.type, 'GUILD_TEXT');
    assert.equal(thread.mock.calls[0].arguments[0].data.type, 'GUILD_PUBLIC_THREAD');
});
