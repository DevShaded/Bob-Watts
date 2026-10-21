import assert from 'node:assert/strict';
import { test } from 'node:test';
import { startBot } from '../../src/application.mjs';
import type { StoredGuild } from '../../src/persistence.mjs';
import { OfflineGateway, OfflineInteraction, startupEnvironment } from './discord.mjs';
import { guildState, offlinePersistence } from './event-fixtures.mjs';

function storedGuild(): StoredGuild {
    return {
        guildId: 'guild', prefix: '!', memberCount: 7, premiumSubscriptionCount: 2,
        premiumTier: 'TIER_1', verified: false, createdTimestamp: '2020-01-01',
        GuildSettings: [{ name: 'Stored example', description: null, iconURL: null, ownerID: 'owner',
            rulesChannelID: null, systemChannelID: null, defaultMessageNotifications: 'ONLY_MENTIONS', verificationLevel: 'VERY_HIGH' }],
    };
}
await test('serverinfo replies with stored guild information and current member and role information', async () => {
    const gateway = new OfflineGateway();
    gateway.getGuildInformation = () => Promise.resolve({ guild: guildState(), onlineMembers: 3, roleIds: ['guild', 'role'] });
    await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: { ...offlinePersistence(), guild: () => Promise.resolve(storedGuild()) } });
    const interaction = new OfflineInteraction();
    interaction.commandName = 'serverinfo';
    await gateway.dispatch(interaction);
    assert.partialDeepStrictEqual(interaction.responses, [{ method: 'reply', payload: { embeds: [{
        title: 'Stored example', description: 'This server does not have any description!',
        fields: [
            { name: '👑 Server Owner', value: '<@owner>' },
            { name: '🆔 Owner ID', value: '`owner`' },
            { name: '🆔 Server ID', value: '`guild`' },
            { name: '🤖 Bot Prefix', value: '`!`' },
            { name: '\u200b', value: '\u200b' },
            { name: '📊 Member Count', value: '7' },
            { name: '🟢 Online Members', value: '3' },
            { name: '💎 Boosting Count', value: '2' },
            { name: '✨ Premium Tier', value: 'Tier 1' },
            { name: '☑️ Verified Server', value: 'Server is not verified' },
            { name: '📅 Server Created', value: '<t:1577836800:R>' },
            { name: '📨 Rules', value: 'Rules channel has not been setup!' },
            { name: '📨 System Channel', value: 'System Channel has not been setup!' },
            { name: '📨 Notification Settings', value: 'Receive notifications only for @mentions' },
            { name: '🎚️ Verification Level', value: 'Must have a verified phone number on Discord account' },
            { name: '🎚️ Server Roles', value: '<@&role>' },
        ], footer: { text: 'Test bot' },
    }] } }]);
});

await test('serverinfo creates missing guild state and reloads persisted settings before replying', async () => {
    const gateway = new OfflineGateway();
    gateway.getGuildInformation = () => Promise.resolve({ guild: guildState(), onlineMembers: 0, roleIds: ['guild'] });
    let saved = false;
    const writes: unknown[] = [];
    await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: {
        ...offlinePersistence(),
        guild: () => Promise.resolve(saved ? storedGuild() : null),
        saveGuild: (guild, settings) => { saved = true; writes.push({ guild, settings }); return Promise.resolve(); },
    } });
    const interaction = new OfflineInteraction();
    interaction.commandName = 'serverinfo';
    await gateway.dispatch(interaction);
    assert.partialDeepStrictEqual(writes, [{ guild: { premiumTier: 'TIER_1' }, settings: { verificationLevel: 'VERY_HIGH' } }]);
    assert.partialDeepStrictEqual(interaction.responses, [{ payload: { embeds: [{ title: 'Stored example', fields: [
        { name: '👑 Server Owner' }, { name: '🆔 Owner ID' }, { name: '🆔 Server ID' }, { name: '🤖 Bot Prefix' },
        { name: '\u200b' }, { name: '📊 Member Count' }, { name: '🟢 Online Members' }, { name: '💎 Boosting Count' },
        { name: '✨ Premium Tier' }, { name: '☑️ Verified Server' }, { name: '📅 Server Created' }, { name: '📨 Rules' },
        { name: '📨 System Channel' }, { name: '📨 Notification Settings' }, { name: '🎚️ Verification Level' },
        { name: '🎚️ Server Roles', value: 'This server has no roles' },
    ] }] } }]);
});

await test('serverinfo handles DMs, unavailable guilds, and missing persisted settings privately', async () => {
    for (const scenario of ['dm', 'unavailable', 'missing-settings']) {
        const gateway = new OfflineGateway();
        gateway.getGuildInformation = () => Promise.resolve(scenario === 'unavailable' ? null : { guild: guildState(), onlineMembers: 0, roleIds: [] });
        await startBot({ env: startupEnvironment, createGateway: () => gateway, persistence: {
            ...offlinePersistence(), guild: () => Promise.resolve({ ...storedGuild(), GuildSettings: [] }),
        } });
        const interaction = new OfflineInteraction();
        interaction.commandName = 'serverinfo';
        if (scenario === 'dm') interaction.guild = null;
        await gateway.dispatch(interaction);
        assert.deepEqual(interaction.responses, [{ method: 'reply', payload: { content: 'Server information is unavailable here.', flags: 64 } }]);
    }
});
