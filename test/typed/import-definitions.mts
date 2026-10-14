import { Client, REST } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { mock } from 'node:test';

const unexpected = (): never => { throw new Error('Import must not start external services'); };
mock.method(Client.prototype, 'login', unexpected);
mock.method(REST.prototype, 'put', unexpected);
mock.method(PrismaClient.prototype, '$connect', unexpected);

await import('../../src/application.mjs');
await import('../../src/database.mjs');
await import('../../src/database-enums.mjs');
await import('../../src/moderator-level.mjs');
