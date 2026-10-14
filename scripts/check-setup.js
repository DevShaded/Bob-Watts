'use strict';

require('dotenv').config({ quiet: true });

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Prisma } = require('@prisma/client');

const prisma = require('../App/Database');

function loadModules(directory) {
    const modules = [];

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const filename = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            modules.push(...loadModules(filename));
        } else if (entry.name.endsWith('.js')) {
            modules.push(require(filename));
        }
    }

    return modules;
}

async function main() {
    assert.equal(process.versions.node.split('.')[0], '24', 'Use Node.js 24 (see .nvmrc).');
    assert.ok(['development', 'production'].includes(process.env.APP_ENV),
        'Set APP_ENV to development or production in .env.');

    const commands = loadModules(path.join(__dirname, '../Commands'));
    const names = new Set();
    for (const command of commands) {
        const definition = command.data.toJSON();
        assert.equal(command.name, definition.name);
        assert.equal(typeof command.execute, 'function');
        assert.ok(!names.has(command.name), `Duplicate command: ${command.name}`);
        names.add(command.name);
    }
    assert.ok(commands.length > 0, 'No commands found.');
    console.log(`Loaded and validated ${commands.length} slash command definitions.`);

    const events = loadModules(path.join(__dirname, '../App/Events'));
    for (const event of events) {
        assert.equal(typeof event.name, 'string');
        assert.equal(typeof event.execute, 'function');
    }
    console.log(`Loaded ${events.length} event handlers.`);

    await prisma.$connect();
    for (const model of Prisma.dmmf.datamodel.models) {
        // Query every model to check that the database matches the generated client.
        await prisma[model.name[0].toLowerCase() + model.name.slice(1)].findFirst();
    }
    console.log(`Database connected; all ${Prisma.dmmf.datamodel.models.length} models queried successfully.`);

    const missing = ['APP_TOKEN', 'APP_CLIENT_ID', 'APP_GUILD_ID', 'APP_CHANNEL_ID']
        .filter(name => !process.env[name]?.trim());
    if (missing.length) {
        console.log(`Local setup passed. Discord still needs these .env values: ${missing.join(', ')}.`);
    } else {
        console.log('Local setup passed. Discord settings are present; authentication is not checked here.');
    }
}

main()
    .catch(error => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
