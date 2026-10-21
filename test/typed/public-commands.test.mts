import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, UserFlagsBitField } from 'discord.js';
import type { APIEmbed } from 'discord.js';
import { registerCommands, startBot } from '../../src/application.mjs';
import type { Command, CommandCategory } from '../../src/contracts.mjs';
import { commands } from '../../src/registry.mjs';
import { OfflineGateway, OfflineInteraction, startupEnvironment } from './discord.mjs';

function replyEmbed(interaction: OfflineInteraction): APIEmbed {
    assert.equal(interaction.responses.length, 1);
    const response = interaction.responses[0];
    assert.equal(response?.method, 'reply');
    const embed = response.payload.embeds?.[0];
    assert.ok(embed && !('toJSON' in embed));
    assert.deepEqual(new EmbedBuilder(embed).toJSON(), embed);
    if (embed.timestamp) assert.equal(new Date(embed.timestamp).toISOString(), embed.timestamp);
    return embed;
}

await test('compiled dispatch flips a coin with the established Discord payload', async t => {
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, createGateway: () => gateway });
    for (const [random, face] of [[0, 'Heads'], [0.999999, 'Tails']] satisfies [number, string][]) {
        t.mock.method(Math, 'random', () => random);
        const interaction = new OfflineInteraction();
        interaction.commandName = 'coinflip';
        await gateway.dispatch(interaction);
        assert.deepEqual(interaction.responses, [{
            method: 'reply', payload: { embeds: [{
                color: 0x17a2b8,
                description: `<:coin:620255307284742154> I flipped a coin and it landed on **${face}**`,
            }] },
        }]);
        t.mock.restoreAll();
    }
});

await test('malformed required fortune and game input uses the application failure reply', async () => {
    const errors: unknown[] = [];
    const gateway = new OfflineGateway();
    await startBot({
        env: startupEnvironment, createGateway: () => gateway,
        reportError: error => { errors.push(error); },
    });
    for (const [commandName, tool] of [['8ball', null], ['rps', null], ['rps', 'invalid']] satisfies [string, string | null][]) {
        const interaction = new OfflineInteraction();
        interaction.commandName = commandName;
        if (tool !== null) interaction.strings.set('tool', tool);
        await gateway.dispatch(interaction);
        assert.deepEqual(interaction.responses, [{ method: 'reply', payload: {
            content: 'Well that didn\'t work, try another command maybe?', flags: MessageFlags.Ephemeral,
        } }]);
    }
    assert.equal(errors.length, 3);
});

await test('user information preserves member dates, role mentions, avatars and known or new badges', async () => {
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, createGateway: () => gateway });
    for (const customBadge of [undefined, '<:staff:909196883514241068>']) {
        const interaction = new OfflineInteraction();
        interaction.commandName = 'userinfo';
        interaction.selectedUser = { ...interaction.user, id: '999', tag: 'Selected user' };
        const memberUser = {
            ...interaction.selectedUser, createdTimestamp: new Date(2020, 0, 1, 15, 30).getTime(),
            flags: new UserFlagsBitField(['Staff', 'VerifiedDeveloper', 'ActiveDeveloper', 'VerifiedBot']),
        };
        if (customBadge) interaction.client.emojis.cache.set('909196883514241068', { toString: () => customBadge });
        interaction.members.set('999', {
            user: memberUser, joinedAt: new Date(2021, 0, 1, 16, 45),
            roles: {
                cache: new Map([['123', { id: '123' }], ['234567890123456789', { id: '234567890123456789' }], ['456', { id: '456' }]]),
                highest: { id: '456', name: 'Moderator' },
            },
        });
        await gateway.dispatch(interaction);
        const embed = replyEmbed(interaction);
        assert.equal(embed.title, 'Selected user | 999');
        assert.deepEqual(embed.thumbnail, { url: 'https://example.com/avatar.png' });
        assert.equal(embed.description, 'Here is the information about <@999>');
        assert.deepEqual(embed.fields, [
            { name: '\u200b', value: '\u200b', inline: false },
            { name: 'User ID', value: '`999`', inline: true },
            { name: 'Username', value: '`Selected user`', inline: true },
            { name: 'Highest Role', value: 'Moderator', inline: true },
            { name: 'Joined Discord', value: '`2020-01-01, 03:30 PM`', inline: true },
            { name: 'Member Since', value: '`2021-01-01, 04:45 PM`', inline: true },
            { name: 'Badge(s)', value: `${customBadge ?? 'Staff'}, Verified Bot, VerifiedDeveloper, ActiveDeveloper`, inline: true },
            { name: 'Roles', value: '<@&123>, <@&456>', inline: false },
        ]);
        assert.equal(embed.color, undefined);
        assert.deepEqual(embed.footer, { text: 'Test bot' });
        assert.ok(embed.timestamp);
    }
});

await test('user information rejects missing users, guilds and uncached members with a private reply', async () => {
    const errors: unknown[] = [];
    const gateway = new OfflineGateway();
    await startBot({
        env: startupEnvironment, createGateway: () => gateway,
        reportError: error => { errors.push(error); },
    });
    for (const missing of ['user', 'guild', 'member']) {
        const interaction = new OfflineInteraction();
        interaction.commandName = 'userinfo';
        if (missing === 'user') interaction.selectedUser = null;
        if (missing === 'guild') interaction.guild = null;
        await gateway.dispatch(interaction);
        assert.deepEqual(interaction.responses, [{ method: 'reply', payload: {
            content: 'User could not be found in this server!', flags: MessageFlags.Ephemeral,
        } }]);
    }
    assert.deepEqual(errors, []);
});

await test('user information handles null join dates, missing flags and members with only everyone', async () => {
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, createGateway: () => gateway });
    const interaction = new OfflineInteraction();
    interaction.commandName = 'userinfo';
    interaction.members.set(interaction.user.id, {
        user: interaction.user, joinedAt: null,
        roles: {
            cache: new Map([['234567890123456789', { id: '234567890123456789' }]]),
            highest: { id: '234567890123456789', name: '@everyone' },
        },
    });
    await gateway.dispatch(interaction);
    const embed = replyEmbed(interaction);
    assert.partialDeepStrictEqual(embed.fields, [
        {}, {}, {}, { name: 'Highest Role', value: 'None' }, {},
        { name: 'Member Since', value: '`Unknown`' }, { name: 'Badge(s)', value: 'None' },
        { name: 'Roles', value: 'This user has no roles' },
    ]);
});

await test('bot information preserves statistics, version and support links without PM2', async t => {
    t.mock.method(process, 'uptime', () => 90061);
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, createGateway: () => gateway });
    for (const founderEmoji of [undefined, '<:founder:952556627863683135>']) {
        const interaction = new OfflineInteraction();
        interaction.commandName = 'botinfo';
        if (founderEmoji) {
            interaction.client.emojis.cache.set('952556627863683135', { toString: () => founderEmoji });
        }
        await gateway.dispatch(interaction);
        const embed = replyEmbed(interaction);
        assert.equal(embed.title, 'Test bot Info');
        assert.deepEqual(embed.author, { name: 'Bot Information', icon_url: 'https://example.com/bot.png' });
        assert.equal(embed.color, 0x17a2b8);
        assert.equal(embed.description, 'Bob Watts is a multipurpose bot that does many things, from Fun and Informative commands to Moderation and Logging commands!\n\nBob Watts can be customized with many things like, custom Welcome/Goodbye messages, and moderation logging etc.');
        assert.deepEqual(embed.fields, [
            { name: `${founderEmoji ?? '👑'} Founder`, value: '```DevShaded#1435```', inline: false },
            { name: '📦 Library', value: '```Discord.js```', inline: true },
            { name: '📊 Server Count', value: '```1,234```', inline: true },
            { name: '📊 Member Served', value: '```5,678```', inline: true },
            { name: '▶️ Bot Version', value: '```3.0.0```', inline: true },
            { name: '🏓 Latency', value: '```42 milliseconds```', inline: true },
            { name: '🌍 Region', value: '```London, UK```', inline: true },
            { name: '🤖 Bot Creation', value: '```2020-01-01```', inline: true },
            { name: '⏱️ Uptime', value: '```1d, 1h, 1m, 1s```', inline: true },
        ]);
        assert.deepEqual(embed.footer, { text: 'Test bot' });
        assert.ok(embed.timestamp);
        const payload: unknown = JSON.parse(JSON.stringify(interaction.responses[0]?.payload));
        assert.partialDeepStrictEqual(payload, { components: [{ type: 1, components: [
            { type: 2, style: 5, url: 'https://discord.gg/jfCv4XAfHA', label: 'Support Server' },
            { type: 2, style: 5, url: 'https://github.com/DevShaded/Bob-Watts', label: 'GitHub' },
            { type: 2, style: 5, url: 'https://top.gg/bot/661979662997782541', label: 'TOP.GG' },
        ] }] });
    }
});

await test('help displays shared registry names in category order regardless of permissions or optional settings', async () => {
    const remainingCategories: [CommandCategory, string[]][] = [
        ['Moderation', ['ban', 'clean', 'clearinfractions', 'infractions', 'kick', 'mute', 'unban', 'unmute', 'vckick', 'warn']],
        ['Settings', ['add', 'delete', 'remove', 'set']],
        ['Information', ['randomcat', 'randomdog', 'weather']],
        ['Public', ['botinfo', 'serverinfo', 'userinfo']],
    ];
    const productionNames = new Set(commands.map(command => command.data.toJSON().name));
    const metadataFixtures: Command[] = remainingCategories.flatMap(([category, names]) => names
        .filter(name => !productionNames.has(name)).map(name => ({
        category,
        data: new SlashCommandBuilder().setName(name).setDescription('Representative category metadata')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        execute: () => Promise.reject(new Error('Metadata fixtures must not execute')),
        })));
    const commandRegistry = [...commands, ...metadataFixtures];
    const registeredNames: string[] = [];
    await registerCommands({
        env: { APP_ENV: 'production', APP_TOKEN: 'offline', APP_CLIENT_ID: '123' },
        commandRegistry,
        createRest: () => ({ put: (_route, options) => {
            registeredNames.push(...options.body.map(definition => definition.name));
            return Promise.resolve();
        } }),
    });
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, createGateway: () => gateway, commandRegistry });
    const interaction = new OfflineInteraction();
    interaction.commandName = 'help';
    interaction.guild = null;
    await gateway.dispatch(interaction);
    const embed = replyEmbed(interaction);
    assert.equal(embed.title, 'Bot Commands');
    assert.equal(embed.color, 0x17a2b8);
    assert.equal(embed.description, 'Here are all of the commands that are available from Bob Watts!');
    assert.deepEqual(embed.fields, [
        { name: '😀 Fun', value: '`/8ball`\n`/coinflip`\n`/cookie`\n`/diceroll`\n`/hug`\n`/kiss`\n`/rps`\n`/slap`', inline: true },
        { name: '🛡️ Moderation', value: '`/ban`\n`/clean`\n`/clearinfractions`\n`/infractions`\n`/kick`\n`/mute`\n`/unban`\n`/unmute`\n`/vckick`\n`/warn`', inline: true },
        { name: '👥 Public', value: '`/botinfo`\n`/help`\n`/ping`\n`/serverinfo`\n`/userinfo`', inline: true },
        { name: '⚙️ Settings', value: '`/add`\n`/delete`\n`/remove`\n`/set`', inline: true },
        { name: 'ℹ️ Information', value: '`/randomcat`\n`/randomdog`\n`/weather`', inline: true },
        { name: 'Hope this helps!', value: 'I really hope it does', inline: true },
    ]);
    assert.deepEqual(embed.footer, { text: 'Test bot' });
    assert.ok(embed.timestamp);
    const displayedNames = embed.fields.slice(0, 5).flatMap(field => field.value.split('\n'));
    assert.deepEqual(displayedNames.slice().sort(), registeredNames.map(name => `\`/${name}\``).sort());
    const payload: unknown = JSON.parse(JSON.stringify(interaction.responses[0]?.payload));
    assert.partialDeepStrictEqual(payload, { components: [{ type: 1, components: [{
        type: 2, style: 5, url: 'https://discord.gg/jfCv4XAfHA', label: 'Support Server',
    }] }] });
});

await test('help remains a valid Discord reply while migration categories are empty', async () => {
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, createGateway: () => gateway });
    const interaction = new OfflineInteraction();
    interaction.commandName = 'help';
    await gateway.dispatch(interaction);
    const embed = replyEmbed(interaction);
    assert.ok(embed.fields?.every(field => field.value.length > 0));
    assert.deepEqual(embed.fields?.filter(field => field.value === '\u200b').map(field => field.name), [
        '⚙️ Settings', 'ℹ️ Information',
    ]);
});

await test('compiled rock-paper-scissors dispatch preserves all nine game outcomes', async t => {
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, createGateway: () => gateway });
    for (const [tool, random, outcome] of [
        ['rock', 0, 'we have a draw. My hand was **rock**'],
        ['paper', 0, 'you won. My hand was **Rock**'],
        ['scissors', 0, 'you lost. My hand was **Rock**'],
        ['rock', 0.5, 'you lost. My hand was **Paper**'],
        ['paper', 0.5, 'we have a draw. My hand was **paper**'],
        ['scissors', 0.5, 'you won. My hand was **Paper**'],
        ['rock', 0.999999, 'you won. My hand was **Scissors**'],
        ['paper', 0.999999, 'you lost. My hand was **Scissors**'],
        ['scissors', 0.999999, 'we have a draw. My hand was **scissors**'],
    ] satisfies [string, number, string][]) {
        t.mock.method(Math, 'random', () => random);
        const interaction = new OfflineInteraction();
        interaction.commandName = 'rps';
        interaction.strings.set('tool', tool);
        await gateway.dispatch(interaction);
        const embed = replyEmbed(interaction);
        assert.equal(embed.description, `<@123456789012345678>, ${outcome}`);
        assert.equal(embed.color, 0x17a2b8);
        assert.deepEqual(embed.footer, { text: 'Test bot' });
        assert.ok(embed.timestamp);
        t.mock.restoreAll();
    }
});

await test('compiled dispatch preserves hug, kiss and slap mentions and rejects unresolved targets', async t => {
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, createGateway: () => gateway });
    for (const [name, random, description] of [
        ['hug', 0, '🤗 <@123456789012345678> gave <@999> a hug'],
        ['kiss', 0, '💋 <@123456789012345678> kissed <@999> ***fast***'],
        ['kiss', 0.5, '💋 <@123456789012345678> kissed <@999> *cutely*'],
        ['kiss', 0.999999, '💋 <@123456789012345678> kissed <@999> **on the check**'],
        ['slap', 0, '👏 <@123456789012345678> slapped <@999> hardly'],
    ] satisfies [string, number, string][]) {
        t.mock.method(Math, 'random', () => random);
        const interaction = new OfflineInteraction();
        interaction.commandName = name;
        interaction.selectedUser = { ...interaction.user, id: '999' };
        await gateway.dispatch(interaction);
        const embed = replyEmbed(interaction);
        assert.equal(embed.color, 0x17a2b8);
        assert.equal(embed.description, description);
        assert.deepEqual(embed.footer, { text: 'Test bot' });
        assert.ok(embed.timestamp);
        t.mock.restoreAll();
    }
    for (const name of ['hug', 'kiss', 'slap']) {
        const interaction = new OfflineInteraction();
        interaction.commandName = name;
        interaction.selectedUser = null;
        await gateway.dispatch(interaction);
        assert.deepEqual(interaction.responses, [{
            method: 'reply', payload: { content: 'Could not find that user!', flags: MessageFlags.Ephemeral },
        }]);
    }
});

await test('compiled dispatch preserves fortune, cookie and dice replies at both random boundaries', async t => {
    const gateway = new OfflineGateway();
    await startBot({ env: startupEnvironment, createGateway: () => gateway });
    for (const [name, first, last] of [
        ['8ball', ':8ball: <@123456789012345678>, It is Certain.', ':8ball: <@123456789012345678>, Very doubtful'],
        ['cookie', ':fortune_cookie: <@123456789012345678>, Someone is looking up to you. Don\'t let that person down.',
            ':fortune_cookie: <@123456789012345678>, HELP ME NOW PLEASE! jk, I don\'t need help! Just a bot haha'],
        ['diceroll', '🎲 I threw a dice and it turned out to be **1**', '🎲 I threw a dice and it turned out to be **6**'],
    ] satisfies [string, string, string][]) {
        for (const [random, description] of [[0, first], [0.999999, last]] satisfies [number, string][]) {
            t.mock.method(Math, 'random', () => random);
            const interaction = new OfflineInteraction();
            interaction.commandName = name;
            interaction.strings.set('message', 'Will this work?');
            await gateway.dispatch(interaction);
            assert.partialDeepStrictEqual(interaction.responses, [{
                method: 'reply', payload: { embeds: [{ color: 0x17a2b8, description }] },
            }]);
            if (name === '8ball') {
                assert.partialDeepStrictEqual(interaction.responses, [{ payload: { embeds: [{
                    footer: { text: 'Original message: Will this work?' },
                }] } }]);
            }
            if (name === 'cookie') {
                assert.partialDeepStrictEqual(interaction.responses, [{ payload: { embeds: [{
                    footer: { text: 'Test bot' },
                }] } }]);
            }
            t.mock.restoreAll();
        }
    }
});
