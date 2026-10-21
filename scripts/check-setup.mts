import { checkSetup } from '../src/setup.mjs';
import { isMain, runCli } from '../src/process.mjs';

if (isMain(import.meta.url)) await runCli(() => checkSetup());
