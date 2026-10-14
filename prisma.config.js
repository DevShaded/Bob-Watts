'use strict';

require('dotenv').config({ quiet: true });
const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: { path: 'prisma/migrations' },
    // Generation does not need credentials; database commands require DATABASE_URL.
    datasource: { url: process.env.DATABASE_URL },
});
