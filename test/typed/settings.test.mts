import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MessageFlags, ChannelType, GuildPremiumTier, GuildDefaultMessageNotifications, GuildExplicitContentFilter, GuildMFALevel, GuildVerificationLevel } from 'discord.js';
import { OfflineSettingsDatabase } from './settings-database.mjs';
import { startBot } from '../../src/application.mjs';
import { OfflineGateway, OfflineInteraction, startupEnvironment } from './discord.mjs';

await test('settings dispatch denies unauthorized callers privately', async () => {
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, database: new OfflineSettingsDatabase(), createGateway: () => gateway });
    for (const name of ['set', 'remove', 'add', 'delete']) {
        const interaction = new OfflineInteraction();
        interaction.commandName = name;
        await gateway.dispatch(interaction);
        assert.partialDeepStrictEqual(interaction.responses, [{ payload: {
            content: "You dont have **ADMINISTRATOR** permission enabled, so you can't run this command!",
            flags: MessageFlags.Ephemeral,
        } }]);
    }
});

await test('administrator can set join log channel through dispatch', async () => {
    const gateway = new OfflineGateway();
    const database = new OfflineSettingsDatabase();
    await startBot({ env: startupEnvironment, database, createGateway: () => gateway });
    const interaction = new OfflineInteraction();
    interaction.commandName = 'set';
    interaction.administrator = true;
    await gateway.dispatch(interaction);
    assert.deepEqual(database.logWrites, [{ guildId: '234567890123456789', data: { guildId: '234567890123456789', welcome_log: 'channel' } }]);
    assert.partialDeepStrictEqual(interaction.responses, [{ payload: { flags: MessageFlags.Ephemeral, embeds: [{
        color: 0x28a745, title: 'Join log channel setup success!', description: '<#channel> will now log user joins!',
    }] } }]);
});

await test('all supported settings preserve stored fields and Discord responses on creation and update', async () => {
    for (const [subcommand, field, value, title] of [
        ['joinchannel', 'welcome_log', 'channel', 'Join log channel setup success!'],
        ['leavechannel', 'goodbye_log', 'channel', 'Leave log channel setup success!'],
        ['editchannel', 'edit_log', 'channel', 'Edit log channel setup success!'],
        ['deletechannel', 'delete_log', 'channel', 'Delete log channel setup success!'],
        ['infractionchannel', 'infractions_log', 'channel', 'Infraction log channel setup success!'],
        ['muterole', 'mute_role', 'role', 'Mute role setup success!'],
        ['autorole', 'join_role', 'role', 'Auto role setup success!'],
        ['welcomemessage', 'welcome_message', 'Hello {user}', 'Welcome message setup success!'],
        ['goodbyemessage', 'goodbye_message', 'Hello {user}', 'Goodbye message setup success!'],
    ]) {
        assert.ok(subcommand && field && value && title);
        for (const exists of [false, true]) {
            const database = new OfflineSettingsDatabase();
            if (exists) database.log = emptyLog();
            const gateway = new OfflineGateway();
            await startBot({ env: startupEnvironment, database, createGateway: () => gateway });
            const interaction = new OfflineInteraction();
            interaction.administrator = true;
            interaction.commandName = 'set';
            interaction.subcommand = subcommand;
            interaction.strings.set('message', 'Hello {user}');
            await gateway.dispatch(interaction);
            assert.deepEqual(database.logWrites, [{ guildId: '234567890123456789', data: {
                ...(!exists ? { guildId: '234567890123456789' } : {}), [field]: value,
            } }]);
            assert.partialDeepStrictEqual(interaction.responses, [{ payload: { flags: MessageFlags.Ephemeral, embeds: [{ color: 0x28a745, title }] } }]);
        }
    }
});

function emptyLog() {
    return { welcome_log: null, goodbye_log: null, edit_log: null, delete_log: null,
        infractions_log: null, mute_role: null, join_role: null, welcome_message: null, goodbye_message: null };
}

await test('remove clears only the selected stored setting, or reports missing configuration privately', async () => {
    for (const [subcommand, field] of [
        ['joinchannel', 'welcome_log'], ['leavechannel', 'goodbye_log'], ['editchannel', 'edit_log'],
        ['deletechannel', 'delete_log'], ['infractionchannel', 'infractions_log'], ['muterole', 'mute_role'],
        ['autorole', 'join_role'], ['welcomemessage', 'welcome_message'], ['goodbyemessage', 'goodbye_message'],
    ]) {
        assert.ok(subcommand && field);
        for (const state of ['missing-row', 'missing-value', 'configured']) {
            const database = new OfflineSettingsDatabase();
            if (state !== 'missing-row') database.log = { ...emptyLog(), ...(state === 'configured' ? { [field]: 'old-value' } : {}) };
            const gateway = new OfflineGateway();
            await startBot({ env: startupEnvironment, database, createGateway: () => gateway });
            const interaction = new OfflineInteraction();
            interaction.commandName = 'remove';
            interaction.administrator = true;
            interaction.subcommand = subcommand;
            await gateway.dispatch(interaction);
            assert.deepEqual(database.logWrites, state === 'configured' ? [{ guildId: '234567890123456789', data: { [field]: null } }] : []);
            assert.partialDeepStrictEqual(interaction.responses, [{ payload: {
                flags: MessageFlags.Ephemeral, embeds: [{ color: state === 'configured' ? 0x28a745 : 0xff0000 }],
            } }]);
        }
    }
});

await test('administrator can add or replace each moderator level and notify the target', async () => {
    for (const [subcommand, level, label] of [
        ['administrator', 1, 'administrator'], ['moderator', 2, 'moderator'], ['softmoderator', 3, 'soft moderator'],
    ] satisfies [string, number, string][]) {
        for (const existing of [false, true]) {
            const database = new OfflineSettingsDatabase();
            const gateway = new OfflineGateway();
            await startBot({ env: startupEnvironment, database, createGateway: () => gateway });
            const interaction = new OfflineInteraction();
            interaction.administrator = true;
            interaction.commandName = 'add';
            interaction.subcommand = subcommand;
            if (existing) database.levels.set('234567890123456789:123456789012345678', 2);
            const messages: unknown[] = [];
            interaction.selectedUser = { ...interaction.user, send: payload => { messages.push(payload); return Promise.resolve(); } };
            await gateway.dispatch(interaction);
            assert.deepEqual(database.moderatorWrites, [{ guildId: '234567890123456789', accountId: '123456789012345678', level }]);
            assert.equal(database.moderatorDeletes.length, existing ? 1 : 0);
            assert.partialDeepStrictEqual(interaction.responses, [{ payload: { flags: MessageFlags.Ephemeral, embeds: [{
                color: 0x28a745, description: existing
                    ? `<@123456789012345678> has now been updated to ${label} of this server!`
                    : `<@123456789012345678> is now ${level === 1 ? 'an' : 'a'} ${label} of this server!`,
            }] } }]);
            assert.equal(messages.length, 1);
        }
    }
});

await test('delete removes only matching moderator levels and preserves target notifications', async () => {
    for (const [subcommand, level, label] of [
        ['administrator', 1, 'Administrator'], ['moderator', 2, 'Moderator'], ['softmoderator', 3, 'Soft Moderator'],
    ] satisfies [string, number, string][]) {
        for (const currentLevel of [undefined, 1, 2, 3]) {
            const database = new OfflineSettingsDatabase();
            const gateway = new OfflineGateway();
            await startBot({ env: startupEnvironment, database, createGateway: () => gateway });
            const interaction = new OfflineInteraction();
            interaction.administrator = true;
            interaction.commandName = 'delete';
            interaction.subcommand = subcommand;
            if (currentLevel !== undefined) database.levels.set('234567890123456789:123456789012345678', currentLevel);
            const messages: unknown[] = [];
            interaction.selectedUser = { ...interaction.user, send: payload => { messages.push(payload); return Promise.resolve(); } };
            await gateway.dispatch(interaction);
            const matches = currentLevel === level;
            assert.deepEqual(database.moderatorDeletes, matches ? [{ guildId: '234567890123456789', accountId: '123456789012345678' }] : []);
            assert.deepEqual(database.moderatorWrites, []);
            assert.partialDeepStrictEqual(interaction.responses, [{ payload: { flags: MessageFlags.Ephemeral, embeds: [{
                color: matches ? 0x28a745 : 0xff0033, description: matches
                    ? `<@123456789012345678> has now been removed as ${label} in this server`
                    : `<@123456789012345678> is not a ${label} in this server!`,
            }] } }]);
            assert.equal(messages.length, matches ? 1 : 0);
        }
    }
});

await test('settings reject absent or incompatible resources without persisting invalid values', async () => {
    for (const [subcommand, missing, content] of [
        ['joinchannel', 'channel', "Sorry, I can't find a supported channel!"],
        ['joinchannel', 'category', "Sorry, I can't find a supported channel!"],
        ['muterole', 'role', "Sorry, I can't find this role!"],
        ['welcomemessage', 'message', "Sorry, I can't find this message!"],
    ]) {
        assert.ok(subcommand && content);
        const database = new OfflineSettingsDatabase();
        const gateway = new OfflineGateway();
        await startBot({ env: startupEnvironment, database, createGateway: () => gateway });
        const interaction = new OfflineInteraction();
        interaction.administrator = true;
        interaction.commandName = 'set';
        interaction.subcommand = subcommand;
        if (missing === 'channel') interaction.selectedChannel = null;
        if (missing === 'category') interaction.selectedChannel = { id: 'category', type: ChannelType.GuildCategory };
        if (missing === 'role') interaction.selectedRole = null;
        await gateway.dispatch(interaction);
        assert.deepEqual(database.logWrites, []);
        assert.partialDeepStrictEqual(interaction.responses, [{ payload: { flags: MessageFlags.Ephemeral, content } }]);
    }
});

await test('failed settings writes report the operation failure privately without a success reply', async t => {
    t.mock.method(console, 'error', () => {});
    for (const commandName of ['set', 'remove']) {
        for (const exists of [false, true]) {
            const database = new OfflineSettingsDatabase();
            database.failWrite = true;
            if (exists || commandName === 'remove') database.log = { ...emptyLog(), welcome_log: 'old-channel' };
            const gateway = new OfflineGateway();
            await startBot({ env: startupEnvironment, database, createGateway: () => gateway, reportError: () => {} });
            const interaction = new OfflineInteraction();
            interaction.administrator = true;
            interaction.commandName = commandName;
            await gateway.dispatch(interaction);
            assert.deepEqual(database.logWrites, []);
            assert.partialDeepStrictEqual(interaction.responses, [{ payload: { flags: MessageFlags.Ephemeral, embeds: [{
                color: 0xff0000, title: commandName === 'set' ? 'Join log channel setup did not succeed!' : 'Join log channel deletion did not succeed!',
            }] } }]);
            assert.equal(interaction.responses.length, 1);
        }
    }
});

await test('all settings commands preserve Discord and stored administrator authorization', async () => {
    for (const commandName of ['set', 'remove', 'add', 'delete']) {
        for (const administrator of [false, true]) {
            for (const storedLevel of [undefined, 1, 2, 3]) {
                const database = new OfflineSettingsDatabase();
                database.log = { ...emptyLog(), welcome_log: 'old' };
                if (storedLevel !== undefined) database.levels.set('234567890123456789:123456789012345678', storedLevel);
                database.levels.set('234567890123456789:target', 2);
                const gateway = new OfflineGateway();
                await startBot({ env: startupEnvironment, database, createGateway: () => gateway });
                const interaction = new OfflineInteraction();
                interaction.commandName = commandName;
                interaction.administrator = administrator;
                if (commandName === 'add' || commandName === 'delete') interaction.subcommand = 'moderator';
                interaction.selectedUser = { ...interaction.user, id: 'target' };
                await gateway.dispatch(interaction);
                const allowed = administrator || storedLevel === 1;
                assert.equal(database.logWrites.length + database.moderatorWrites.length + database.moderatorDeletes.length > 0, allowed,
                    `${commandName}: Discord administrator ${String(administrator)}, stored level ${String(storedLevel)}`);
                assert.partialDeepStrictEqual(interaction.responses, [{ payload: { flags: MessageFlags.Ephemeral } }]);
                if (!allowed) assert.equal(interaction.responses[0]?.payload.content, "You dont have **ADMINISTRATOR** permission enabled, so you can't run this command!");
            }
        }
    }
});

await test('moderator operations initialize users and related guild settings with historical stored enums', async () => {
    for (const commandName of ['add', 'delete']) {
        for (const [premiumTier, notifications, filter, mfa, verification, storedTier, storedNotifications, storedFilter, storedMfa, storedVerification] of [
            [GuildPremiumTier.None, GuildDefaultMessageNotifications.AllMessages, GuildExplicitContentFilter.Disabled, GuildMFALevel.None, GuildVerificationLevel.None, 'NONE', 'ALL_MESSAGES', 'DISABLED', 'NONE', 'NONE'],
            [GuildPremiumTier.Tier1, GuildDefaultMessageNotifications.OnlyMentions, GuildExplicitContentFilter.MembersWithoutRoles, GuildMFALevel.Elevated, GuildVerificationLevel.Low, 'TIER_1', 'ONLY_MENTIONS', 'MEMBERS_WITHOUT_ROLES', 'ELEVATED', 'LOW'],
            [GuildPremiumTier.Tier2, GuildDefaultMessageNotifications.AllMessages, GuildExplicitContentFilter.AllMembers, GuildMFALevel.None, GuildVerificationLevel.Medium, 'TIER_2', 'ALL_MESSAGES', 'ALL_MEMBERS', 'NONE', 'MEDIUM'],
            [GuildPremiumTier.Tier3, GuildDefaultMessageNotifications.OnlyMentions, GuildExplicitContentFilter.AllMembers, GuildMFALevel.Elevated, GuildVerificationLevel.High, 'TIER_3', 'ONLY_MENTIONS', 'ALL_MEMBERS', 'ELEVATED', 'HIGH'],
            [GuildPremiumTier.Tier3, GuildDefaultMessageNotifications.OnlyMentions, GuildExplicitContentFilter.AllMembers, GuildMFALevel.Elevated, GuildVerificationLevel.VeryHigh, 'TIER_3', 'ONLY_MENTIONS', 'ALL_MEMBERS', 'ELEVATED', 'VERY_HIGH'],
        ] satisfies [GuildPremiumTier, GuildDefaultMessageNotifications, GuildExplicitContentFilter, GuildMFALevel, GuildVerificationLevel, string, string, string, string, string][]) {
            const database = new OfflineSettingsDatabase();
            database.userExists = false;
            database.guildExists = false;
            const gateway = new OfflineGateway();
            await startBot({ env: startupEnvironment, database, createGateway: () => gateway });
            const interaction = new OfflineInteraction();
            interaction.commandName = commandName;
            interaction.administrator = true;
            interaction.subcommand = 'softmoderator';
            assert.ok(interaction.guild);
            interaction.guild = { ...interaction.guild, premiumTier, defaultMessageNotifications: notifications,
                explicitContentFilter: filter, mfaLevel: mfa, verificationLevel: verification,
                createdTimestamp: new Date(2020, 0, 1).getTime(), joinedTimestamp: new Date(2021, 0, 2, 3, 4, 5).getTime() };
            interaction.selectedUser = { ...interaction.user, createdTimestamp: new Date(2019, 0, 2, 3, 4, 5).getTime() };
            await gateway.dispatch(interaction);
            assert.deepEqual(database.userWrites, [{
                accountId: '123456789012345678', username: 'Test user', discriminator: '0', avatar: null, bot: false,
                createdTimestamp: '2019-01-02 03-04-05',
            }]);
            assert.partialDeepStrictEqual(database.guildWrites, [{
                guildId: '234567890123456789', createdTimestamp: '2020-01-01', joinedTimestamp: '2021-01-02 03-04-05',
                premiumTier: storedTier, available: true, large: false, memberCount: 10, maximumMembers: 100,
                maximumPresences: null, partnered: false, verified: false, premiumSubscriptionCount: 0,
                GuildSettings: { create: {
                    defaultMessageNotifications: storedNotifications, explicitContentFilter: storedFilter,
                    mfaLevel: storedMfa, verificationLevel: storedVerification, name: 'Test guild',
                    ownerID: 'owner', shardID: 0, preferredLocale: 'en-US',
                } },
            }]);
        }
    }
});

await test('settings handle missing guilds, executors and moderator targets privately without writes', async () => {
    for (const commandName of ['set', 'remove', 'add', 'delete']) {
        for (const missing of ['guild', 'executor', 'target']) {
            if (missing === 'target' && (commandName === 'set' || commandName === 'remove')) continue;
            const database = new OfflineSettingsDatabase();
            const gateway = new OfflineGateway();
            await startBot({ env: startupEnvironment, database, createGateway: () => gateway });
            const interaction = new OfflineInteraction();
            interaction.administrator = true;
            interaction.commandName = commandName;
            interaction.subcommand = 'moderator';
            if (missing === 'guild') interaction.guild = null;
            if (missing === 'executor') {
                assert.ok(interaction.guild);
                interaction.guild = { ...interaction.guild, members: { cache: interaction.members, fetch: () => Promise.resolve(null) } };
            }
            if (missing === 'target') interaction.selectedUser = null;
            await gateway.dispatch(interaction);
            assert.deepEqual([...database.logWrites, ...database.moderatorWrites, ...database.moderatorDeletes, ...database.userWrites, ...database.guildWrites], []);
            assert.partialDeepStrictEqual(interaction.responses, [{ payload: { flags: MessageFlags.Ephemeral, content:
                missing === 'guild' ? 'This command is only available in a server!'
                    : missing === 'target' ? "Sorry, I can't find this user!"
                        : "You dont have **ADMINISTRATOR** permission enabled, so you can't run this command!",
            } }]);
        }
    }
});

await test('missing auto role reports the auto role rather than the mute role', async () => {
    const database = new OfflineSettingsDatabase();
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, database, createGateway: () => gateway });
    const interaction = new OfflineInteraction();
    interaction.administrator = true;
    interaction.commandName = 'remove';
    interaction.subcommand = 'autorole';
    await gateway.dispatch(interaction);
    assert.partialDeepStrictEqual(interaction.responses, [{ payload: { embeds: [{
        title: 'Could not find auto role!', description: "It looks like you haven't setup the auto role at all",
    }] } }]);
});

await test('blocked moderator DMs do not undo successful operations or produce another reply', async t => {
    t.mock.method(console, 'log', () => {});
    for (const commandName of ['add', 'delete']) {
        const database = new OfflineSettingsDatabase();
        database.levels.set('234567890123456789:123456789012345678', 2);
        const gateway = new OfflineGateway();
        const errors: unknown[] = [];
        await startBot({ env: startupEnvironment, database, createGateway: () => gateway, reportError: error => { errors.push(error); } });
        const interaction = new OfflineInteraction();
        interaction.administrator = true;
        interaction.commandName = commandName;
        interaction.subcommand = 'moderator';
        interaction.selectedUser = { ...interaction.user, send: () => Promise.reject(new Error('DM blocked')) };
        await gateway.dispatch(interaction);
        assert.deepEqual(errors, []);
        assert.equal(interaction.responses.length, 1);
        assert.partialDeepStrictEqual(interaction.responses, [{ payload: { embeds: [{ color: 0x28a745 }] } }]);
        assert.deepEqual(database.moderatorDeletes, [{ guildId: '234567890123456789', accountId: '123456789012345678' }]);
        assert.equal(database.moderatorWrites.length, commandName === 'add' ? 1 : 0);
    }
});

await test('Discord reply failures after settings persistence reach application error handling', async () => {
    for (const commandName of ['set', 'remove']) {
        const database = new OfflineSettingsDatabase();
        database.log = { ...emptyLog(), welcome_log: 'old-channel' };
        const gateway = new OfflineGateway();
        const errors: unknown[] = [];
        await startBot({ env: startupEnvironment, database, createGateway: () => gateway, reportError: error => { errors.push(error); } });
        const interaction = new OfflineInteraction();
        interaction.administrator = true;
        interaction.commandName = commandName;
        const failure = new Error('Discord reply unavailable');
        interaction.replyFailure = failure;
        await gateway.dispatch(interaction);
        assert.deepEqual(errors, [failure]);
        assert.deepEqual(database.logWrites, [{ guildId: '234567890123456789', data: { welcome_log: commandName === 'set' ? 'channel' : null } }]);
        assert.partialDeepStrictEqual(interaction.responses, [{ payload: {
            content: "Well that didn't work, try another command maybe?", flags: MessageFlags.Ephemeral,
        } }]);
    }
});
