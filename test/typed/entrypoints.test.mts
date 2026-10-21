import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

await test('compiled definitions import without environment files, credentials, or external activity', () => {
    const result = spawnSync(process.execPath, [
        fileURLToPath(new URL('./import-definitions.mjs', import.meta.url)),
    ], { env: {}, cwd: tmpdir(), encoding: 'utf8', timeout: 10000 });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, '');
});

await test('compiled help and bot information resolve runtime resources outside the repository working directory', () => {
    const result = spawnSync(process.execPath, [
        fileURLToPath(new URL('./runtime-replies.mjs', import.meta.url)),
    ], { env: {}, cwd: tmpdir(), encoding: 'utf8', timeout: 10000 });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, '');
});
