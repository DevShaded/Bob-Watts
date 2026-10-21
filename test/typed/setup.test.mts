import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkSetup } from '../../src/setup.mjs';

await test('setup validates shared definitions and every database model without Discord configuration', async () => {
    const messages: string[] = [];
    const lifecycle: string[] = [];
    await checkSetup({
        env: { DATABASE_URL: 'mysql://offline:offline@127.0.0.1:1/offline' },
        createDatabase: config => {
            assert.equal(config.databaseUrl, 'mysql://offline:offline@127.0.0.1:1/offline');
            return {
                connect: () => { lifecycle.push('connect'); return Promise.resolve(); },
                queryModels: () => { lifecycle.push('query'); return Promise.resolve(14); },
                disconnect: () => { lifecycle.push('disconnect'); return Promise.resolve(); },
            };
        },
        report: message => { messages.push(message); },
    });
    assert.deepEqual(lifecycle, ['connect', 'query', 'disconnect']);
    assert.deepEqual(messages, [
        'Loaded and validated 30 slash command definitions.',
        'Loaded 10 event handlers.',
        'Database connected; all 14 models queried successfully.',
        'Local setup passed. Discord still needs these .env values: APP_TOKEN, APP_CLIENT_ID, APP_GUILD_ID, APP_CHANNEL_ID.',
    ]);
});

await test('setup rejects missing database configuration before creating external clients', async () => {
    await assert.rejects(checkSetup({ env: {}, createDatabase: () => {
        throw new Error('Database created before configuration validation');
    } }), /Missing .env values: DATABASE_URL/);
});

await test('setup closes failed connections and failed model checks without reporting success', async () => {
    for (const stage of ['connect', 'query']) {
        const failure = new Error(`Offline ${stage} failure`);
        const messages: string[] = [];
        let disconnected = false;
        await assert.rejects(checkSetup({
            env: { DATABASE_URL: 'mysql://offline:offline@127.0.0.1:1/offline' },
            createDatabase: () => ({
                connect: () => stage === 'connect' ? Promise.reject(failure) : Promise.resolve(),
                queryModels: () => Promise.reject(failure),
                disconnect: () => { disconnected = true; return Promise.resolve(); },
            }),
            report: message => { messages.push(message); },
        }), error => error === failure);
        assert.equal(disconnected, true);
        assert.ok(messages.every(message => !message.includes('Local setup passed')));
    }
});

await test('setup reports configured Discord settings without authenticating or requiring APP_ENV', async () => {
    const messages: string[] = [];
    await checkSetup({
        env: { DATABASE_URL: 'mysql://offline:offline@127.0.0.1:1/offline', APP_TOKEN: 'token',
            APP_CLIENT_ID: '123', APP_GUILD_ID: '456', APP_CHANNEL_ID: '789' },
        createDatabase: () => ({ connect: () => Promise.resolve(), queryModels: () => Promise.resolve(14), disconnect: () => Promise.resolve() }),
        report: message => { messages.push(message); },
    });
    assert.equal(messages.at(-1), 'Local setup passed. Discord settings are present; authentication is not checked here.');
});
