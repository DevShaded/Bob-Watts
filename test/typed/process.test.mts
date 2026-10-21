import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

await test('compiled Node and PM2 entrypoints execute offline and report process failures', () => {
    const result = spawnSync(process.execPath, [
        fileURLToPath(new URL('../../../test/production/entrypoints.mts', import.meta.url)),
    ], { env: {}, encoding: 'utf8', timeout: 60000 });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
});
