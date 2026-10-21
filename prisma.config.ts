import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ quiet: true });
const databaseUrl = process.env.DATABASE_URL;

// Generation works before credentials exist. Database operations require a URL.
export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: { path: 'prisma/migrations' },
    ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
