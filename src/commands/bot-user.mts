import type { CommandInteraction } from '../contracts.mjs';

export function botUser(interaction: CommandInteraction): NonNullable<CommandInteraction['client']['user']> {
    const user = interaction.client.user;
    if (!user) throw new Error('Discord client is not ready.');
    return user;
}
