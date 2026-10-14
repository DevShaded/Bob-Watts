'use strict';

require('dotenv').config({ quiet: true });

const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

if (!process.env.DATABASE_URL) {
    throw new Error('Set DATABASE_URL in .env before starting the bot or checking the database.');
}

// Share one connection pool across commands and event handlers.
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
module.exports = new PrismaClient({ adapter });
