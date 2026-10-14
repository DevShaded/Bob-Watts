import { MessageFlags } from 'discord.js';
import type { CommandInteraction } from '../contracts.mjs';
import { botUser } from './bot-user.mjs';

export async function replyWithUserAction(interaction: CommandInteraction, describe: (userId: string) => string): Promise<void> {
    const mentioned = interaction.options.getUser('user');
    if (!mentioned) {
        await interaction.reply({ content: 'Could not find that user!', flags: MessageFlags.Ephemeral });
        return;
    }
    await interaction.reply({ embeds: [{
        color: 0x17a2b8,
        description: describe(mentioned.id),
        timestamp: new Date().toISOString(),
        footer: { text: botUser(interaction).username },
    }] });
}
