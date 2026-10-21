import assert from 'node:assert/strict';
import { mock } from 'node:test';
import { Client, REST } from 'discord.js';
import { PrismaClient } from '@prisma/client';

// Only external SDK operations are replaced. The emitted CLIs and gateway run.
mock.method(Client.prototype, 'login', function (this: Client, token: string) {
    if (process.env.TEST_FAILURE) return Promise.reject(new Error('Offline login failure'));
    for (const name of [
        'clientReady', 'guildCreate', 'guildDelete', 'guildMemberAdd', 'guildMemberRemove',
        'guildMemberUpdate', 'guildUnavailable', 'guildUpdate', 'interactionCreate', 'messageCreate',
    ]) assert.equal(this.listenerCount(name), 1, name);
    console.log(`LOGIN ${token}`);
    return Promise.resolve(token);
});
mock.method(REST.prototype, 'put', function (this: REST, route: string, options: { body?: unknown }) {
    if (process.env.TEST_FAILURE) return Promise.reject(new Error('Offline registration failure'));
    assert.ok(Array.isArray(options.body));
    console.log(`REGISTER ${this.options.version} ${route} ${String(options.body.length)}`);
    return Promise.resolve();
});
mock.method(PrismaClient.prototype, '$connect', () => {
    throw new Error('Offline verification must not connect to a database');
});
