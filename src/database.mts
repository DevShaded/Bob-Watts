import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import type { DatabaseConfig } from './configuration.mjs';

// The owning operation creates one client and shares it with its consumers.
// Importing definitions never creates a connection pool or reads credentials.
export function createDatabase(config: DatabaseConfig): PrismaClient {
    const adapter = new PrismaMariaDb(config.databaseUrl);
    return new PrismaClient({ adapter });
}
