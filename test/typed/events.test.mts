import assert from 'node:assert/strict';
import { test } from 'node:test';
import { startBot } from '../../src/application.mjs';
import { OfflineGateway, startupEnvironment } from './discord.mjs';

await test('startup accepts missing optional operational logging IDs', async () => {
    const gateway = new OfflineGateway();
    await startBot({
        env: { ...startupEnvironment, APP_GUILD_ID: undefined, APP_CHANNEL_ID: undefined },
        createGateway: () => gateway,
    });
    assert.deepEqual(gateway.tokens, ['offline-token']);
});

await test('startup selects the latest stored activity once and preserves unknown-type fallback', async () => {
    const gateway = new OfflineGateway();
    const activity = { id: 2, name: 'A game', type: 'UNKNOWN', url: null, shardId: '0', createdAt: new Date(), updatedAt: new Date() };
    await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: { ...offlinePersistence(), activity: () => Promise.resolve(activity) } });
    const activities: unknown[] = [];
    const ready = { username: 'Bob', setActivity: (name: string, options: unknown) => { activities.push({ name, options }); } };
    for (const event of gateway.events) if (event.name === 'clientReady') await event.execute(ready);
    assert.deepEqual(activities, [{ name: 'A game', options: { type: 0 } }]);
});

import { offlinePersistence, guildState, memberState, messageState, threadState } from './event-fixtures.mjs';

await test('guild events preserve historical stored enums and mark unavailable guilds', async () => {
    const gateway = new OfflineGateway();
    const writes: unknown[] = [];
    await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: {
        ...offlinePersistence(),
        saveGuild: (guild, settings) => { writes.push({ guild, settings }); return Promise.resolve(); },
        unavailableGuild: id => { writes.push({ unavailable: id }); return Promise.resolve(); },
    } });
    const create = gateway.events.find(event => event.name === 'guildCreate');
    const unavailable = gateway.events.find(event => event.name === 'guildUnavailable');
    assert.ok(create && unavailable);
    await create.execute(guildState());
    await unavailable.execute({ ...guildState(), available: false });
    assert.partialDeepStrictEqual(writes, [{
        guild: { guildId: 'guild', premiumTier: 'TIER_1', memberCount: 7, createdTimestamp: '2020-01-01' },
        settings: { guildId: 'guild', defaultMessageNotifications: 'ONLY_MENTIONS', explicitContentFilter: 'ALL_MEMBERS', mfaLevel: 'ELEVATED', verificationLevel: 'VERY_HIGH' },
    }, { unavailable: 'guild' }]);
});

await test('member arrival persists state and applies join role without a welcome channel', async () => {
    const gateway = new OfflineGateway();
    const writes: unknown[] = [];
    await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: {
        ...offlinePersistence(),
        saveUser: data => { writes.push({ user: data }); return Promise.resolve(); },
        saveMember: data => { writes.push({ member: data }); return Promise.resolve(); },
        guildLogs: () => Promise.resolve({
            id: 1, guildId: 'guild', delete_log: null, edit_log: null, goodbye_log: null,
            goodbye_message: null, infractions_log: null, join_role: 'role', mute_role: null,
            welcome_log: null, welcome_message: null, createdAt: new Date(), updatedAt: new Date(),
        }),
    } });
    const member = memberState();
    const roles: string[] = [];
    const arrival = gateway.events.find(event => event.name === 'guildMemberAdd');
    assert.ok(arrival);
    await arrival.execute({ ...member, roles: { cache: new Map([['role', { id: 'role' }]]), add: role => { roles.push(role); return Promise.resolve(); } } });
    assert.partialDeepStrictEqual(writes, [{ user: { accountId: 'user', username: 'Alice' } }, { member: { accountId: 'user', guildId: 'guild', joinedTimestamp: null } }]);
    assert.deepEqual(roles, ['role']);
});

await test('member departure updates counts even for partial members and sends configured goodbye', async () => {
    const gateway = new OfflineGateway();
    const writes: unknown[] = [];
    const sent: unknown[] = [];
    gateway.sendLog = (guild, channel, payload) => { sent.push({ guild, channel, payload }); return Promise.resolve(); };
    await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: {
        ...offlinePersistence(),
        updateMemberCount: (guild, count) => { writes.push({ guild, count }); return Promise.resolve(); },
        guildLogs: () => Promise.resolve({
            id: 1, guildId: 'guild', delete_log: null, edit_log: null, goodbye_log: 'goodbye',
            goodbye_message: null, infractions_log: null, join_role: null, mute_role: null,
            welcome_log: null, welcome_message: null, createdAt: new Date(), updatedAt: new Date(),
        }),
    } });
    const departure = gateway.events.find(event => event.name === 'guildMemberRemove');
    assert.ok(departure);
    await departure.execute({ guild: guildState(), user: null });
    await departure.execute(memberState());
    assert.deepEqual(writes, [{ guild: 'guild', count: 7 }, { guild: 'guild', count: 7 }]);
    assert.partialDeepStrictEqual(sent, [{ guild: 'guild', channel: 'goodbye', payload: { embeds: [{ description: 'Left the server', author: { name: 'Alice (user)' } }] } }]);
});

await test('guild and member notifications retain operational payloads and repeated event semantics', async () => {
    const gateway = new OfflineGateway();
    const sent: unknown[] = [];
    gateway.sendLog = (guild, channel, payload) => { sent.push({ guild, channel, payload }); return Promise.resolve(); };
    await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: {
        ...offlinePersistence(), guildLogs: () => Promise.resolve({
            id: 1, guildId: 'guild', delete_log: null, edit_log: null, goodbye_log: null,
            goodbye_message: null, infractions_log: null, join_role: null, mute_role: null,
            welcome_log: 'welcome', welcome_message: 'Welcome!', createdAt: new Date(), updatedAt: new Date(),
        }),
    } });
    assert.deepEqual(gateway.events.map(event => [event.name, event.once]), [
        ['guildCreate', false], ['guildDelete', false], ['guildUnavailable', false], ['guildUpdate', false],
        ['guildMemberAdd', false], ['guildMemberRemove', false], ['guildMemberUpdate', false],
        ['messageCreate', false], ['clientReady', true], ['interactionCreate', false],
    ]);
    for (const event of gateway.events) {
        if (event.name === 'guildCreate' || event.name === 'guildDelete') await event.execute(guildState());
        if (event.name === 'guildUpdate') await event.execute(guildState(), { ...guildState(), name: 'Renamed' });
        if (event.name === 'guildUnavailable') await event.execute({ ...guildState(), available: false });
        if (event.name === 'guildMemberAdd') await event.execute(memberState());
    }
    assert.partialDeepStrictEqual(sent, [
        { guild: '456', channel: '789', payload: { embeds: [{ description: 'I have joined **Example**' }] } },
        { payload: { embeds: [{ description: 'I have left **Example**' }] } },
        { payload: { embeds: [{ description: '**Example** is now unavailable' }] } },
        { payload: { embeds: [{ description: 'Somebody has updated **Example** new name **Renamed**' }] } },
        { guild: 'guild', channel: 'welcome', payload: { embeds: [{ description: 'Welcome!' }] } },
    ]);
});

await test('guild message delivery persists channel, member, content and historical channel type', async () => {
    const gateway = new OfflineGateway();
    const writes: unknown[] = [];
    await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: {
        ...offlinePersistence(),
        saveChannel: data => { writes.push({ channel: data }); return Promise.resolve(); },
        saveGuildChannel: data => { writes.push({ guildChannel: data }); return Promise.resolve(); },
        saveMessage: (data, channelName) => { writes.push({ message: data, channelName }); return Promise.resolve(); },
    } });
    const delivery = gateway.events.find(event => event.name === 'messageCreate');
    assert.ok(delivery);
    await delivery.execute(messageState());
    assert.partialDeepStrictEqual(writes, [
        { channel: { channelId: 'channel', type: 'GUILD_TEXT', name: 'general', nsfw: false } },
        { guildChannel: { guildId: 'guild', channelId: 'channel', permissionsLocked: null } },
        { message: { messageId: 'message', accountId: 'user', guildId: 'guild', channelId: 'channel', content: 'Hello' }, channelName: 'general' },
    ]);
});

await test('thread messages create their required channel row and preserve historical thread enums', async () => {
    const gateway = new OfflineGateway();
    const writes: unknown[] = [];
    await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: {
        ...offlinePersistence(),
        saveChannel: data => { writes.push({ channel: data }); return Promise.resolve(); },
        saveThread: data => { writes.push({ thread: data }); return Promise.resolve(); },
        saveMessage: data => { writes.push({ message: data }); return Promise.resolve(); },
    } });
    const delivery = gateway.events.find(event => event.name === 'messageCreate');
    assert.ok(delivery);
    await delivery.execute({ ...messageState(), channel: { ...threadState(), ownerId: 'user' } });
    assert.partialDeepStrictEqual(writes, [
        { channel: { channelId: 'thread', type: 'GUILD_PUBLIC_THREAD' } },
        { thread: { threadId: 'thread', ownerId: 'user', type: 'GUILD_PUBLIC_THREAD', archivedAt: null, archivedTimestamp: null } },
        { message: { channelId: 'thread', messageId: 'message' } },
    ]);
});

await test('message delivery ignores bots and webhooks, supports DM help, and tolerates uncached members', async () => {
    const gateway = new OfflineGateway();
    const replies: unknown[] = [];
    const writes: unknown[] = [];
    await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: {
        ...offlinePersistence(), saveMessage: data => { writes.push(data); return Promise.resolve(); },
    } });
    const delivery = gateway.events.find(event => event.name === 'messageCreate');
    assert.ok(delivery);
    const message = { ...messageState(), content: '!help extra', reply: (options: unknown) => { replies.push(options); return Promise.resolve(); } };
    await delivery.execute({ ...message, author: { ...message.author, bot: true } });
    await delivery.execute({ ...message, webhookId: 'webhook' });
    assert.deepEqual(writes, []);
    assert.deepEqual(replies, []);
    await delivery.execute({ ...message, guild: null, member: null, channel: null });
    assert.partialDeepStrictEqual(replies, [{
        embeds: [{ title: 'Announcement', description: 'As of <t:1654293600:F>, the Bob Watts dev team has decided to remove message commands, and replaced them with slash commands. If you can\'t find any slash commands from Bob Watts, then you need to re-add the bot to the server!' }],
        components: [{ type: 1, components: [{ type: 2, style: 5, url: 'https://devshaded.com/bobwatts', label: 'Invite Link' }] }],
    }]);
    assert.deepEqual(writes, []);
    await delivery.execute({ ...messageState(), member: null });
    assert.partialDeepStrictEqual(writes, [{ messageId: 'message', content: 'Hello' }]);
});

await test('ready selects default and every historical activity type only once', async () => {
    for (const [type, expected] of [[null, 3], ['PLAYING', 0], ['STREAMING', 1], ['LISTENING', 2], ['WATCHING', 3], ['CUSTOM', 4], ['COMPETING', 5]] satisfies [string | null, number][]) {
        const gateway = new OfflineGateway();
        await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: {
            ...offlinePersistence(), activity: () => Promise.resolve(type === null ? null : {
                id: 1, name: 'Activity', url: 'https://example.com', type, shardId: '0', createdAt: new Date(), updatedAt: new Date(),
            }),
        } });
        const activities: unknown[] = [];
        const client = { username: 'Bob', setActivity: (name: string, options: unknown) => { activities.push({ name, options }); } };
        await gateway.ready(client);
        await gateway.ready(client);
        assert.deepEqual(activities, [{ name: type === null ? 'devshaded.com/bobwatts' : 'Activity', options: { type: expected, ...(type === null ? {} : { url: 'https://example.com' }) } }]);
    }
});

await test('member updates persist users and null dates while unavailable guild events do no writes', async () => {
    const gateway = new OfflineGateway();
    const writes: unknown[] = [];
    await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: {
        ...offlinePersistence(), saveMember: data => { writes.push(data); return Promise.resolve(); },
    } });
    const update = gateway.events.find(event => event.name === 'guildMemberUpdate');
    const create = gateway.events.find(event => event.name === 'guildCreate');
    assert.ok(update && create);
    const member = memberState();
    await update.execute({ guild: member.guild, user: null }, { ...member, nickname: 'New name' });
    await update.execute(member, { ...member, guild: { ...member.guild, available: false } });
    await create.execute({ ...guildState(), available: false });
    assert.partialDeepStrictEqual(writes, [{ nickname: 'New name', joinedTimestamp: null, premiumSinceTimestamp: null }]);
});
