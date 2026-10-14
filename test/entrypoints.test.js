'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

test('application entrypoints can be imported without credentials or service activity', () => {
    const result = spawnSync(process.execPath, ['-e', `
        const assert = require('node:assert/strict');
        const { mock } = require('node:test');
        const appRequire = require('node:module').createRequire(process.argv[1]);
        const { Client, REST } = appRequire('discord.js');
        const unexpected = () => { throw new Error('Import must not start services or load configuration'); };
        mock.method(Client.prototype, 'login', unexpected);
        mock.method(REST.prototype, 'put', unexpected);
        mock.method(appRequire('dotenv'), 'config', unexpected);
        const { startBot } = require(process.argv[1]);
        const { registerCommands } = require(process.argv[2]);
        assert.equal(typeof startBot, 'function');
        assert.equal(typeof registerCommands, 'function');
    `, path.join(__dirname, '../index.js'), path.join(__dirname, '../createapplicationcommands.js')], {
        cwd: tmpdir(),
        env: {},
        encoding: 'utf8',
        timeout: 10000,
    });

    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, '');
});

test('CLI entrypoints explicitly start the bot and register commands, and report failures', t => {
    const directory = fs.mkdtempSync(path.join(tmpdir(), 'bob-watts-entrypoints-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const preload = path.join(directory, 'offline.cjs');
    fs.writeFileSync(preload, `
        const { mock } = require('node:test');
        const appRequire = require('node:module').createRequire(process.argv[1]);
        const { Client, REST } = appRequire('discord.js');
        // Only external Discord behavior is replaced; the CLI and application are real.
        mock.method(Client.prototype, 'login', async function (token) {
            if (process.env.TEST_FAILURE) throw new Error('Offline login failure');
            console.log('LOGIN ' + token + ' ' + this.commands.size);
            return token;
        });
        mock.method(REST.prototype, 'put', async function (route, options) {
            if (process.env.TEST_FAILURE) throw new Error('Offline registration failure');
            console.log('REGISTER ' + this.options.version + ' ' + route + ' ' + options.body.length);
        });
    `);

    const env = {
        APP_TOKEN: 'test-token', APP_CLIENT_ID: '123456789012345678',
        APP_GUILD_ID: '234567890123456789',
        DATABASE_URL: 'mysql://test:test@127.0.0.1:1/bobwatts_test',
    };
    for (const environment of ['development', 'production']) {
        for (const [file, expected] of [
            ['index.js', 'LOGIN test-token 30'],
            ['createapplicationcommands.js', environment === 'development'
                ? 'REGISTER 10 /applications/123456789012345678/guilds/234567890123456789/commands 30'
                : 'REGISTER 10 /applications/123456789012345678/commands 30'],
        ]) {
            const result = spawnSync(process.execPath, ['--require', preload, path.join(__dirname, '..', file)], {
                cwd: path.join(__dirname, '..'),
                env: { ...env, APP_ENV: environment },
                encoding: 'utf8',
                timeout: 10000,
            });
            assert.ifError(result.error);
            assert.equal(result.status, 0, result.stderr);
            assert.ok(result.stdout.includes(expected), result.stdout);
            assert.equal(result.stderr, '');
        }
    }

    for (const [file, error] of [
        ['index.js', 'Offline login failure'],
        ['createapplicationcommands.js', 'Offline registration failure'],
    ]) {
        const result = spawnSync(process.execPath, ['--require', preload, path.join(__dirname, '..', file)], {
            cwd: path.join(__dirname, '..'),
            env: { ...env, APP_ENV: 'development', TEST_FAILURE: '1' },
            encoding: 'utf8',
            timeout: 10000,
        });
        assert.ifError(result.error);
        assert.equal(result.status, 1, result.stderr);
        assert.ok(result.stderr.includes(error), result.stderr);
    }
});
