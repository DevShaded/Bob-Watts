import { startBot } from '../src/application.mjs';
import { isMain, runCli } from '../src/process.mjs';

if (isMain(import.meta.url)) await runCli(() => startBot());
