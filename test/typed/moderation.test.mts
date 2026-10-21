import { ModerationInteraction, ModerationStore } from './moderation-fixtures.mjs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EmbedBuilder, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { startBot } from '../../src/application.mjs';
import { OfflineGateway, OfflineInteraction, startupEnvironment } from './discord.mjs';

await test('moderation dispatch rejects commands outside a guild', async () => {
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, createGateway: () => gateway });
    const interaction = new OfflineInteraction();
    interaction.commandName = 'ban';
    interaction.guild = null;
    await gateway.dispatch(interaction);
    assert.deepEqual(interaction.responses, [{ method: 'reply', payload: {
        content: 'This command can only be used in a server!', flags: MessageFlags.Ephemeral,
    } }]);
});

await test('ban denies an executor lacking both Discord permission and moderator level', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const interaction = new ModerationInteraction('ban');
    await gateway.dispatch(interaction);
    assert.deepEqual(interaction.responses, [{ method: 'reply', payload: {
        content: "You do not have permission to **BAN_MEMBERS**, so you can't run this command!", flags: MessageFlags.Ephemeral,
    } }]);
    assert.deepEqual(interaction.target.bans, []);
    assert.deepEqual(database.writes, []);
});

await test('ban converts history days to seconds including zero and writes compatible infractions with optional logging', async () => {
    for (const logging of [false, true]) {
        for (const [days, seconds] of [[0, 0], [2, 172800], [7, 604800]]) {
            const gateway = new OfflineGateway();
            const database = new ModerationStore();
            database.level = 2;
            if (logging) database.settings = { infractions_log: 'log', mute_role: null };
            await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
            const interaction = new ModerationInteraction('ban');
            assert.ok(days !== undefined);
            interaction.integers.set('days', days);
            interaction.strings.set('reason', 'Repeated spam');
            await gateway.dispatch(interaction);
            assert.deepEqual(interaction.target.bans, [{ reason: 'Repeated spam', deleteMessageSeconds: seconds }]);
            assert.deepEqual(database.writes, [{ guildId: 'guild', accountId: '999', reason: 'Repeated spam', type: 'ban', expires: null }]);
            assert.equal(interaction.logs.length, logging ? 1 : 0);
            assert.equal(interaction.responses.length, 1);
            assert.partialDeepStrictEqual(interaction.responses[0]?.payload, {
                embeds: [{ description: logging ? 'That user has been banned!' : 'This user has been banned!' }],
            });
        }
    }
});

await test('ban rejects an unbannable member before attempting the Discord action', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const interaction = new ModerationInteraction('ban');
    interaction.target.bannable = false;
    await gateway.dispatch(interaction);
    assert.partialDeepStrictEqual(interaction.responses[0]?.payload, { embeds: [{ description: 'This user is not bannable!' }], flags: MessageFlags.Ephemeral });
    assert.deepEqual(interaction.target.bans, []);
    assert.deepEqual(database.writes, []);
});

await test('kick uses the Discord string reason and preserves permission and kickability checks', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const interaction = new ModerationInteraction('kick');
    interaction.executor.permissions.add('KickMembers');
    interaction.strings.set('reason', 'Abuse');
    await gateway.dispatch(interaction);
    assert.deepEqual(interaction.target.kicks, ['Abuse']);
    assert.deepEqual(database.writes, [{ guildId: 'guild', accountId: '999', reason: 'Abuse', type: 'kick', expires: null }]);
    const blocked = new ModerationInteraction('kick');
    blocked.executor.permissions.add('KickMembers');
    blocked.target.kickable = false;
    await gateway.dispatch(blocked);
    assert.deepEqual(blocked.target.kicks, []);
    assert.partialDeepStrictEqual(blocked.responses[0]?.payload, { embeds: [{ description: 'This user is not kickable!' }] });
});

await test('custom moderators can unban stored users by string ID without a guild member', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    database.storedUser = { accountId: '888', username: 'Former member', discriminator: '0001', avatar: null };
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const interaction = new ModerationInteraction('unban');
    interaction.selectedUser = null;
    interaction.strings.set('target', '888');
    await gateway.dispatch(interaction);
    assert.deepEqual(interaction.unbans, ['888']);
    assert.deepEqual(database.writes, [{ guildId: 'guild', accountId: '888', reason: 'No reason for unban', type: 'unban', expires: null }]);
    assert.partialDeepStrictEqual(interaction.responses[0]?.payload, { embeds: [{ description: 'This user has been unbanned!' }] });
});

await test('soft moderators can warn and warnings retain the historical type with optional logging and DM', async () => {
    for (const logging of [false, true]) {
        const gateway = new OfflineGateway();
        const database = new ModerationStore();
        database.level = 3;
        if (logging) database.settings = { infractions_log: 'log', mute_role: null };
        await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
        const interaction = new ModerationInteraction('warn');
        await gateway.dispatch(interaction);
        assert.deepEqual(database.writes, [{ guildId: 'guild', accountId: '999', reason: 'No reason provided', type: 'warning', expires: null }]);
        assert.deepEqual(interaction.target.bans, []);
        assert.equal(interaction.logs.length, logging ? 1 : 0);
        assert.equal(interaction.target.dms.length, logging ? 1 : 0);
        assert.partialDeepStrictEqual(interaction.responses[0]?.payload, { embeds: [{ description: logging ? 'That user has been warned!' : 'This user has been warned!' }] });
    }
});

await test('mute adds the configured role and records timed and indefinite durations', async () => {
    for (const days of [undefined, 0, 2]) {
        const gateway = new OfflineGateway();
        const database = new ModerationStore();
        database.settings = { infractions_log: null, mute_role: 'muted' };
        const scheduled: { delay: number; action: () => Promise<void> }[] = [];
        await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database,
            schedule: (delay, action) => { scheduled.push({ delay, action }); },
        });
        const interaction = new ModerationInteraction('mute');
        interaction.executor.permissions.add('ManageMessages');
        if (days !== undefined) interaction.integers.set('days', days);
        await gateway.dispatch(interaction);
        assert.deepEqual(interaction.target.addedRoles, ['muted']);
        assert.deepEqual(database.writes, [{ guildId: 'guild', accountId: '999', reason: 'No reason provided', type: 'mute', expires: days ? '2 day(s)' : null }]);
        if (days) {
            assert.equal(scheduled[0]?.delay, 172800000);
            await scheduled[0].action();
            assert.deepEqual(interaction.target.removedRoles, ['muted']);
            assert.partialDeepStrictEqual(interaction.target.dms.at(-1), { embeds: [{ description: 'Your mute cool down is finished in **Test server**' }] });
        } else assert.deepEqual(scheduled, []);
    }
});

await test('mute rejects missing settings, already muted users and invalid durations without changing roles', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const missing = new ModerationInteraction('mute');
    await gateway.dispatch(missing);
    assert.partialDeepStrictEqual(missing.responses[0]?.payload, { embeds: [{ description: 'This server has not setup a mute role. Set one up with `/set muterole`' }] });
    database.settings = { infractions_log: null, mute_role: 'muted' };
    const already = new ModerationInteraction('mute');
    already.target.roles.cache.set('muted', { id: 'muted' });
    await gateway.dispatch(already);
    assert.partialDeepStrictEqual(already.responses[0]?.payload, { content: 'It looks like this user is already muted!' });
    const invalid = new ModerationInteraction('mute');
    invalid.integers.set('days', -1);
    await gateway.dispatch(invalid);
    assert.partialDeepStrictEqual(invalid.responses[0]?.payload, { content: 'Please provide a valid number of days.', flags: MessageFlags.Ephemeral });
    assert.deepEqual(invalid.target.addedRoles, []);
    assert.deepEqual(database.writes, []);
});

await test('unmute removes only the configured role and rejects members who are not muted', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    database.settings = { infractions_log: 'log', mute_role: 'muted' };
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const interaction = new ModerationInteraction('unmute');
    interaction.target.roles.cache.set('muted', { id: 'muted' });
    await gateway.dispatch(interaction);
    assert.deepEqual(interaction.target.removedRoles, ['muted']);
    assert.deepEqual(database.writes, [{ guildId: 'guild', accountId: '999', reason: 'No reason provided', type: 'unmute', expires: null }]);
    assert.equal(interaction.logs.length, 1);
    const unmuted = new ModerationInteraction('unmute');
    await gateway.dispatch(unmuted);
    assert.partialDeepStrictEqual(unmuted.responses[0]?.payload, { content: 'It looks like this user is not muted!' });
    assert.deepEqual(unmuted.target.removedRoles, []);
});

await test('voice kick disconnects members and safely reports an absent voice channel', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const interaction = new ModerationInteraction('vckick');
    interaction.strings.set('reason', 'Noise');
    await gateway.dispatch(interaction);
    assert.deepEqual(interaction.target.disconnects, ['Noise']);
    assert.deepEqual(database.writes, [{ guildId: 'guild', accountId: '999', reason: 'Noise', type: 'vckick', expires: null }]);
    assert.partialDeepStrictEqual(interaction.responses[0]?.payload, { embeds: [{ description: 'This user has been kicked from <#voice>' }] });
    const absent = new ModerationInteraction('vckick');
    absent.target.voice = { ...absent.target.voice, channel: null };
    await gateway.dispatch(absent);
    assert.deepEqual(absent.target.disconnects, []);
    assert.partialDeepStrictEqual(absent.responses[0]?.payload, { embeds: [{ description: '<@999> is not in a voice channel!' }], flags: MessageFlags.Ephemeral });
});

await test('clean deletes stored target messages and database references before editing its deferred reply', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    database.storedMessages = [{ messageId: 'message-1' }, { messageId: 'message-2' }];
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const interaction = new ModerationInteraction('clean');
    interaction.integers.set('amount', 5);
    await gateway.dispatch(interaction);
    assert.deepEqual(interaction.deleted, ['message-1', 'message-2']);
    assert.deepEqual(database.messageQueries, [{ where: { guildId: 'guild', channelId: 'channel', accountId: '999' }, orderBy: [{ id: 'desc' }], take: 5 }]);
    assert.deepEqual(database.deletedMessages, ['message-1', 'message-2']);
    assert.deepEqual(database.deletedChannelMessages, ['message-1', 'message-2']);
    assert.partialDeepStrictEqual(interaction.responses, [{ method: 'editReply', payload: {
        embeds: [{ description: '2 messages from <@999> has been successfully deleted' }],
    } }]);
    assert.deepEqual(database.writes, []);
});

await test('infraction listing reports stored warning reasons privately without moderation actions', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    database.records = [{ id: 1, type: 'warning', reason: 'Spam' }, { id: 2, type: 'mute', reason: 'Noise' }];
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const interaction = new ModerationInteraction('infractions');
    await gateway.dispatch(interaction);
    assert.partialDeepStrictEqual(interaction.responses[0]?.payload, { embeds: [{ fields: [{ name: 'Infractions (2)', value: '```warning: Spam``` ```mute: Noise```', inline: false }] }], flags: MessageFlags.Ephemeral });
    assert.deepEqual(database.writes, []);
    assert.deepEqual(interaction.target.bans, []);
    database.records = [];
    const empty = new ModerationInteraction('infractions');
    await gateway.dispatch(empty);
    assert.partialDeepStrictEqual(empty.responses[0]?.payload, { embeds: [{ description: '<@999> has no infractions.' }] });
});

await test('administrator infraction clearing removes the newest requested records and reports the actual count', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 1;
    database.records = [{ id: 2, type: 'mute', reason: 'Noise' }, { id: 1, type: 'warning', reason: 'Spam' }, { id: 3, type: 'kick', reason: 'Abuse' }];
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const interaction = new ModerationInteraction('clearinfractions');
    interaction.integers.set('amount', 2);
    await gateway.dispatch(interaction);
    assert.deepEqual(database.deletedInfractions, [3, 2]);
    assert.partialDeepStrictEqual(interaction.responses[0]?.payload, { embeds: [{ description: '2 infractions from <@999> has been successfully removed!' }], flags: MessageFlags.Ephemeral });
    assert.deepEqual(database.writes, []);
});

await test('long infraction histories remain within Discord embed limits using private follow-ups', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    database.records = Array.from({ length: 4 }, (_, index) => ({ id: index, type: 'warning', reason: `${String(index)}:${'x'.repeat(3990)}` }));
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const interaction = new ModerationInteraction('infractions');
    await gateway.dispatch(interaction);
    assert.ok(interaction.responses.length > 1);
    for (const response of interaction.responses) {
        assert.equal(response.payload.flags, MessageFlags.Ephemeral);
        for (const embed of response.payload.embeds ?? []) {
            assert.ok(!('toJSON' in embed));
            assert.ok(embed.fields && embed.fields.length <= 5);
            assert.ok(embed.fields.every(field => field.value.length <= 1024));
            assert.doesNotThrow(() => new EmbedBuilder(embed).toJSON());
        }
    }
    const text = interaction.responses.flatMap(response => response.payload.embeds ?? [])
        .flatMap(embed => 'toJSON' in embed ? [] : embed.fields ?? []).map(field => field.value).join('');
    for (const record of database.records) assert.ok(text.includes(record.reason));
    assert.ok(interaction.responses.slice(1).every(response => response.method === 'followUp'));
});

await test('a configured missing or non-message log channel produces a controlled reply before moderation', async () => {
    for (const commandName of ['ban', 'unban']) {
        for (const channel of ['missing', 'category']) {
            const gateway = new OfflineGateway();
            const database = new ModerationStore();
            database.level = 2;
            database.storedUser = { accountId: '888', username: null, discriminator: null, avatar: null };
            database.settings = { infractions_log: channel, mute_role: null };
            await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
            const interaction = new ModerationInteraction(commandName);
            interaction.strings.set('target', '888');
            interaction.channels.set('category', { id: 'category' });
            await gateway.dispatch(interaction);
            assert.partialDeepStrictEqual(interaction.responses[0]?.payload, { embeds: [{ description: "I could not find the infraction channel you have setup! Make sure it's setup correctly" }] });
            assert.deepEqual(interaction.target.bans, []);
            assert.deepEqual(interaction.unbans, []);
            assert.deepEqual(database.writes, []);
        }
    }
});

await test('moderation retains protections against cleaning, muting or reading and clearing the bot itself', async () => {
    for (const [commandName, description] of [
        ['clean', 'Cannot clear messages from this user!'],
        ['clearinfractions', 'Cannot clear infractions from this user!'],
        ['infractions', 'Cannot get infractions from this user!'],
        ['mute', 'This user is not mutable!'],
    ]) {
        assert.ok(commandName);
        const gateway = new OfflineGateway();
        const database = new ModerationStore();
        database.level = 1;
        database.settings = { infractions_log: null, mute_role: 'muted' };
        await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
        const interaction = new ModerationInteraction(commandName);
        interaction.target.id = 'bot';
        interaction.selectedUser = { ...interaction.target.user, id: 'bot' };
        await gateway.dispatch(interaction);
        assert.partialDeepStrictEqual(interaction.responses[0]?.payload, { embeds: [{ description }], flags: MessageFlags.Ephemeral });
        assert.deepEqual(database.writes, []);
        assert.deepEqual(interaction.target.addedRoles, []);
    }
});

await test('permission denial respects deferred and answered interaction lifecycles', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    for (const [deferred, replied, method] of [[true, false, 'editReply'], [false, true, 'followUp']] satisfies [boolean, boolean, string][]) {
        const interaction = new ModerationInteraction('ban');
        interaction.deferred = deferred;
        interaction.replied = replied;
        await gateway.dispatch(interaction);
        assert.equal(interaction.responses[0]?.method, method);
        assert.equal(interaction.responses[0].payload.content, "You do not have permission to **BAN_MEMBERS**, so you can't run this command!");
    }
});

await test('unban reports Discord unknown-ban responses without writing an infraction', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    database.storedUser = { accountId: '888', username: null, discriminator: null, avatar: null };
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database, reportError: () => undefined });
    const interaction = new ModerationInteraction('unban');
    interaction.strings.set('target', '888');
    interaction.unbanFailure = Object.assign(new Error('Unknown Ban'), { code: 10026 });
    await gateway.dispatch(interaction);
    assert.partialDeepStrictEqual(interaction.responses[0]?.payload, { embeds: [{ description: 'Cannot unban <@888>, because that user is not banned from this server!' }], flags: MessageFlags.Ephemeral });
    assert.deepEqual(database.writes, []);
});

await test('logged moderation retains target notifications for role, voice, message and infraction actions', async () => {
    for (const [commandName, description] of [
        ['mute', 'You have been muted in **Test server** for the following reason(s): \n\nNo reason provided'],
        ['unmute', 'You have been unmuted in **Test server** for the following reason(s): \n\nNo reason provided'],
        ['vckick', 'You have been kicked from the voice channel in **Test server** for the following reason(s): \n\nNo reason provided'],
        ['clean', '1 of your messages in **Test server** have been deleted for the following reason(s): \n\nNo reason provided'],
        ['clearinfractions', '1 of your infractions in **Test server** have been removed for the following reason(s): \n\nNo reason provided'],
    ] satisfies [string, string][]) {
        const gateway = new OfflineGateway();
        const database = new ModerationStore();
        database.level = 1;
        database.settings = { infractions_log: 'log', mute_role: 'muted' };
        database.records = [{ id: 1, type: 'warning', reason: 'Spam' }];
        database.storedMessages = [{ messageId: 'message' }];
        await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
        const interaction = new ModerationInteraction(commandName);
        if (commandName === 'unmute') interaction.target.roles.cache.set('muted', { id: 'muted' });
        await gateway.dispatch(interaction);
        assert.partialDeepStrictEqual(interaction.target.dms, [{ embeds: [{ color: 0xffc107, description }] }]);
        assert.equal(interaction.logs.length, 1);
    }
});

await test('moderation log embeds retain issuer, action, account, join date and reason', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    database.settings = { infractions_log: 'log', mute_role: null };
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const interaction = new ModerationInteraction('ban');
    interaction.strings.set('reason', 'Spam');
    await gateway.dispatch(interaction);
    assert.partialDeepStrictEqual(interaction.logs, [{ embeds: [{ fields: [
        { name: 'Issued By', value: '<@123456789012345678>', inline: false },
        { name: 'Action', value: 'Ban', inline: true },
        { name: 'User ID', value: '`999`', inline: true },
        { name: 'Joined At', value: '<t:1612310400:R>', inline: true },
        { name: 'Reason', value: 'Spam\n', inline: false },
    ] }] }]);
});

await test('production scheduling keeps a 30-day mute until its complete duration elapses', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const setClockTimeout = globalThis.setTimeout;
    t.mock.method(globalThis, 'setTimeout', (action: () => void, delay?: number) => {
        assert.ok(delay !== undefined && delay <= 2147483647, 'Node must receive a representable timer delay');
        return setClockTimeout(action, delay);
    });
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    database.settings = { infractions_log: null, mute_role: 'muted' };
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database });
    const interaction = new ModerationInteraction('mute');
    interaction.integers.set('days', 30);
    await gateway.dispatch(interaction);
    t.mock.timers.tick(2147483647);
    await Promise.resolve();
    assert.deepEqual(interaction.target.removedRoles, []);
    t.mock.timers.tick(444516353);
    await Promise.resolve();
    assert.deepEqual(interaction.target.removedRoles, ['muted']);
});

await test('Discord and database failures reach the application error reply without claiming moderation succeeded', async () => {
    for (const boundary of ['discord', 'database']) {
        const gateway = new OfflineGateway();
        const database = new ModerationStore();
        database.level = 2;
        const errors: unknown[] = [];
        const failure = new Error(`${boundary} unavailable`);
        await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database,
            reportError: error => { errors.push(error); },
        });
        const interaction = new ModerationInteraction('ban');
        if (boundary === 'discord') interaction.target.failure = failure;
        else database.infractionFailure = failure;
        await gateway.dispatch(interaction);
        assert.deepEqual(errors, [failure]);
        assert.deepEqual(interaction.responses, [{ method: 'reply', payload: {
            content: "Well that didn't work, try another command maybe?", flags: MessageFlags.Ephemeral,
        } }]);
        assert.deepEqual(database.writes, []);
    }
});

await test('logged timed mutes retain public confirmation while indefinite mutes remain private', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    database.settings = { infractions_log: 'log', mute_role: 'muted' };
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database, schedule: () => undefined });
    for (const days of [0, 2]) {
        const interaction = new ModerationInteraction('mute');
        interaction.integers.set('days', days);
        await gateway.dispatch(interaction);
        assert.equal(interaction.responses[0]?.payload.flags, days === 0 ? MessageFlags.Ephemeral : undefined);
    }
});

await test('all moderation commands preserve Discord permission alternatives and historical moderator hierarchy', async () => {
    const cases: [string, bigint, readonly boolean[]][] = [
        ['ban', PermissionFlagsBits.BanMembers, [true, true, false]], ['unban', PermissionFlagsBits.BanMembers, [true, true, false]],
        ['kick', PermissionFlagsBits.KickMembers, [true, true, false]], ['vckick', PermissionFlagsBits.MoveMembers, [true, true, false]],
        ['mute', PermissionFlagsBits.ManageMessages, [true, true, false]], ['unmute', PermissionFlagsBits.ManageMessages, [true, true, false]],
        ['clean', PermissionFlagsBits.ManageMessages, [true, true, false]], ['infractions', PermissionFlagsBits.ManageMessages, [true, true, false]],
        ['clearinfractions', PermissionFlagsBits.Administrator, [true, false, false]], ['warn', PermissionFlagsBits.ManageMessages, [true, true, true]],
    ];
    for (const [commandName, permission, outcomes] of cases) {
        for (const level of [null, 1, 2, 3]) {
            const gateway = new OfflineGateway();
            const database = new ModerationStore();
            database.level = level;
            database.settings = { infractions_log: null, mute_role: 'muted' };
            database.storedUser = { accountId: '888', username: 'Former member', discriminator: null, avatar: null };
            database.records = [{ id: 1, type: 'warning', reason: 'Spam' }];
            database.storedMessages = [{ messageId: 'message' }];
            const errors: unknown[] = [];
            await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database, reportError: error => { errors.push(error); } });
            const interaction = new ModerationInteraction(commandName);
            interaction.strings.set('target', '888');
            if (commandName === 'unmute') interaction.target.roles.cache.set('muted', { id: 'muted' });
            // With no database moderator, verify the command's Discord permission alternative.
            if (level === null) interaction.executor.permissions.add(permission);
            await gateway.dispatch(interaction);
            const expectedAllowed = level === null || outcomes[level - 1];
            const denial = interaction.responses[0]?.payload.content?.includes('You do not have permission');
            assert.equal(Boolean(denial), !expectedAllowed, `${commandName}: level ${String(level)}`);
            assert.equal(interaction.responses.length, 1);
            assert.deepEqual(errors, []);
        }
    }
});

await test('startup creates one moderation database lazily and disconnects it when the gateway shuts down', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    let opened = 0;
    const bot = await startBot({ env: startupEnvironment, createGateway: () => gateway,
        createCommandDatabase: () => {
            opened++;
            return database;
        },
    });
    assert.equal(opened, 0);
    await gateway.dispatch(new ModerationInteraction('warn'));
    await gateway.dispatch(new ModerationInteraction('warn'));
    assert.equal(opened, 1);
    await bot.destroy();
    assert.equal(database.disconnects, 1);
    assert.equal(gateway.destroyed, true);
});

await test('missing targets and departed guild members produce valid replies without moderation writes', async () => {
    const gateway = new OfflineGateway();
    const database = new ModerationStore();
    database.level = 2;
    const errors: unknown[] = [];
    await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database, reportError: error => { errors.push(error); } });
    const missing = new ModerationInteraction('ban');
    missing.selectedUser = null;
    await gateway.dispatch(missing);
    assert.partialDeepStrictEqual(missing.responses[0]?.payload, { content: "Sorry! I can't find this user!", flags: MessageFlags.Ephemeral });
    const departed = new ModerationInteraction('ban');
    departed.memberFailure = new Error('Unknown Member');
    await gateway.dispatch(departed);
    assert.partialDeepStrictEqual(departed.responses[0]?.payload, { content: "Well that didn't work, try another command maybe?", flags: MessageFlags.Ephemeral });
    assert.deepEqual(errors, [departed.memberFailure]);
    assert.deepEqual(database.writes, []);
});

await test('logging failures preserve completed action records and closed DMs do not hide successful warnings', async () => {
    for (const boundary of ['log', 'dm']) {
        const gateway = new OfflineGateway();
        const database = new ModerationStore();
        database.level = 2;
        database.settings = { infractions_log: 'log', mute_role: null };
        const errors: unknown[] = [];
        const failure = new Error(`${boundary} forbidden`);
        await startBot({ env: startupEnvironment, createGateway: () => gateway, createCommandDatabase: () => database, reportError: error => { errors.push(error); } });
        const interaction = new ModerationInteraction(boundary === 'log' ? 'ban' : 'warn');
        if (boundary === 'log') interaction.logFailure = failure;
        else interaction.target.dmFailure = failure;
        await gateway.dispatch(interaction);
        assert.equal(database.writes.length, 1);
        assert.deepEqual(errors, [failure]);
        if (boundary === 'log') {
            assert.equal(interaction.target.bans.length, 1);
            assert.equal(interaction.responses[0]?.payload.content, "Well that didn't work, try another command maybe?");
        } else {
            assert.partialDeepStrictEqual(interaction.responses[0]?.payload, { embeds: [{ description: 'That user has been warned!' }] });
        }
    }
});
