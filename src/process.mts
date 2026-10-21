import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { config } from 'dotenv';

export function isMain(url: string): boolean {
    // PM2 imports ESM through ProcessContainerFork and exposes the real entrypoint here.
    const entrypoint = process.env.pm_exec_path ?? process.argv[1];
    return entrypoint !== undefined && pathToFileURL(resolve(entrypoint)).href === url;
}

export async function runCli(operation: () => Promise<unknown>): Promise<void> {
    try {
        config({ quiet: true });
        await operation();
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
}
