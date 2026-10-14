import assert from 'node:assert/strict';
import { test } from 'node:test';
import { databaseEnums } from '../../src/database-enums.mjs';
import { verifyModeratorLevel } from '../../src/moderator-level.mjs';
import type { ModeratorLevel, ModeratorStore } from '../../src/moderator-level.mjs';
import { historicalDatabaseEnums, moderatorAuthorizationCases } from './fixtures/compatibility.mjs';

await test('shared mappings retain every historical stored enum string', () => {
    assert.deepEqual(databaseEnums, historicalDatabaseEnums);
});

await test('moderator verification preserves all 18 historical authorization outcomes', async () => {
    const identity = { guildId: '456', accountId: '123' };
    const requiredLevels: readonly ModeratorLevel[] = [1, 2, 3];
    for (const { storedLevel, allowed } of moderatorAuthorizationCases) {
        const moderators: ModeratorStore = {
            findFirst: query => {
                assert.deepEqual(query, { where: identity });
                return Promise.resolve(storedLevel === null ? null : { level: storedLevel });
            },
        };
        for (const requiredLevel of requiredLevels) {
            assert.equal(await verifyModeratorLevel(moderators, identity, requiredLevel), allowed[requiredLevel],
                `Stored level ${String(storedLevel)}, required level ${String(requiredLevel)}`);
        }
    }
});
