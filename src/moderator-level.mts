export type ModeratorLevel = 1 | 2 | 3;

export interface ModeratorStore {
    findFirst(query: { where: { guildId: string; accountId: string } }): Promise<{ level: number } | null>;
}

export async function verifyModeratorLevel(
    moderators: ModeratorStore,
    identity: { guildId: string | null; accountId: string },
    requiredLevel: ModeratorLevel,
): Promise<boolean> {
    if (!identity.guildId) return false;
    const moderator = await moderators.findFirst({
        where: { guildId: identity.guildId, accountId: identity.accountId },
    });
    // Historical levels: administrator 1, moderator 2, soft moderator 3.
    // Discord permission checks remain the responsibility of command consumers.
    return moderator !== null && requiredLevel >= moderator.level;
}
