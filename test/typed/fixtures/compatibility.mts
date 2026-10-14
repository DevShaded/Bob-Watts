import type { ModeratorLevel } from '../../../src/moderator-level.mjs';

// Expected values recorded from the pre-migration contracts. Keep these literal
// so a change to the implementation cannot silently update its own expectations.
// Reuse these fixtures at the application boundary as #31–33 migrate consumers.
// Levels 0 and 4 record the historical numeric comparison for unexpected stored
// values; they are not new assignable moderator levels.
export const moderatorAuthorizationCases: readonly {
    storedLevel: number | null;
    allowed: Readonly<Record<ModeratorLevel, boolean>>;
}[] = [
    { storedLevel: null, allowed: { 1: false, 2: false, 3: false } },
    { storedLevel: 0, allowed: { 1: true, 2: true, 3: true } },
    { storedLevel: 1, allowed: { 1: true, 2: true, 3: true } },
    { storedLevel: 2, allowed: { 1: false, 2: true, 3: true } },
    { storedLevel: 3, allowed: { 1: false, 2: false, 3: true } },
    { storedLevel: 4, allowed: { 1: false, 2: false, 3: false } },
];

export const historicalDatabaseEnums = {
    premiumTier: { 0: 'NONE', 1: 'TIER_1', 2: 'TIER_2', 3: 'TIER_3' },
    defaultMessageNotifications: { 0: 'ALL_MESSAGES', 1: 'ONLY_MENTIONS' },
    explicitContentFilter: { 0: 'DISABLED', 1: 'MEMBERS_WITHOUT_ROLES', 2: 'ALL_MEMBERS' },
    mfaLevel: { 0: 'NONE', 1: 'ELEVATED' },
    verificationLevel: { 0: 'NONE', 1: 'LOW', 2: 'MEDIUM', 3: 'HIGH', 4: 'VERY_HIGH' },
    channelType: {
        0: 'GUILD_TEXT',
        1: 'DM',
        2: 'GUILD_VOICE',
        3: 'GROUP_DM',
        4: 'GUILD_CATEGORY',
        5: 'GUILD_NEWS',
        10: 'GUILD_NEWS_THREAD',
        11: 'GUILD_PUBLIC_THREAD',
        12: 'GUILD_PRIVATE_THREAD',
        13: 'GUILD_STAGE_VOICE',
        14: 'GUILD_DIRECTORY',
        15: 'GUILD_FORUM',
        16: 'GUILD_MEDIA',
    },
};
