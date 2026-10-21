import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = new URL('../../', import.meta.url);
const preload = fileURLToPath(new URL('./offline-services.mts', import.meta.url));
const env = {
    APP_TOKEN: 'offline-token', APP_CLIENT_ID: '123', APP_GUILD_ID: '456',
    DATABASE_URL: 'mysql://offline:offline@127.0.0.1:1/offline',
};
for (const environment of ['development', 'production']) {
    for (const [script, expected] of [
        ['start', 'LOGIN offline-token'],
        ['register', environment === 'development'
            ? 'REGISTER 10 /applications/123/guilds/456/commands 30'
            : 'REGISTER 10 /applications/123/commands 30'],
    ] satisfies [string, string][]) {
        const result = spawnSync(process.execPath, ['--import', preload,
            fileURLToPath(new URL(`dist/scripts/${script}.mjs`, root)),
        ], { cwd: tmpdir(), env: { ...env, APP_ENV: environment }, encoding: 'utf8', timeout: 10000 });
        assert.ifError(result.error);
        assert.equal(result.status, 0, result.stderr);
        assert.ok(result.stdout.includes(expected), result.stdout);
        assert.equal(result.stderr, '');
    }
}

for (const [script, message] of [
    ['start', 'Offline login failure'], ['register', 'Offline registration failure'],
] satisfies [string, string][]) {
    const result = spawnSync(process.execPath, ['--import', preload,
        fileURLToPath(new URL(`dist/scripts/${script}.mjs`, root)),
    ], { cwd: tmpdir(), env: { ...env, APP_ENV: 'development', TEST_FAILURE: '1' }, encoding: 'utf8', timeout: 10000 });
    assert.ifError(result.error);
    assert.equal(result.status, 1, result.stderr);
    assert.ok(result.stderr.includes(message), result.stderr);
}

for (const [script, message] of [
    ['start', 'Set APP_ENV'], ['register', 'Set APP_ENV'], ['check-setup', 'DATABASE_URL'],
] satisfies [string, string][]) {
    const result = spawnSync(process.execPath, [fileURLToPath(new URL(`dist/scripts/${script}.mjs`, root))], {
        cwd: tmpdir(), env: {}, encoding: 'utf8', timeout: 10000,
    });
    assert.ifError(result.error);
    assert.equal(result.status, 1, result.stderr);
    assert.ok(result.stderr.includes(message), result.stderr);
}

// Start the documented data-only PM2 configuration in an isolated daemon home.
// The SDK preload prevents login and rejects attempted database connections.



const directory = await mkdtemp(join(tmpdir(), 'bob-watts-pm2-'));
const output = join(directory, 'logs', 'Bob-Watts-out.log');
const pm2 = fileURLToPath(new URL('node_modules/pm2/bin/pm2', root));
function runPm2(args: string[]): ReturnType<typeof spawnSync> {
    return spawnSync(process.execPath, [pm2, ...args], {
        cwd: root, env: { ...env, APP_ENV: 'production', PM2_HOME: directory, PATH: process.env.PATH, NODE_OPTIONS: `--import=${preload}` },
        encoding: 'utf8', timeout: 15000,
    });
}
try {
    const result = runPm2(['start', 'ecosystem.config.json']);
    assert.ifError(result.error);
    assert.equal(result.status, 0, String(result.stderr));
    let contents = '';
    for (let attempt = 0; attempt < 50; attempt++) {
        contents = await readFile(output, 'utf8').catch(() => '');
        if (contents.includes('LOGIN offline-token')) break;
        await setTimeout(100);
    }
    assert.ok(contents.includes('LOGIN offline-token'), `${contents}\n${await readFile(join(directory, 'logs', 'Bob-Watts-error.log'), 'utf8').catch(() => '')}`);
} finally {
    const result = runPm2(['kill']);
    assert.ifError(result.error);
    assert.equal(result.status, 0, String(result.stderr));
    await rm(directory, { recursive: true, force: true });
}
