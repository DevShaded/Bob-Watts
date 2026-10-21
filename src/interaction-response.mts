import type { InteractionReplyOptions } from 'discord.js';
import type { CommandInteraction } from './contracts.mjs';

export async function respond(interaction: CommandInteraction, payload: Pick<InteractionReplyOptions, 'content' | 'embeds' | 'flags'>): Promise<void> {
    if (interaction.deferred && !interaction.replied) {
        // Ephemeral visibility must be selected when deferring, not while editing.
        await interaction.editReply({ ...(payload.content !== undefined ? { content: payload.content } : {}), ...(payload.embeds ? { embeds: payload.embeds } : {}) });
    } else if (interaction.replied) {
        await interaction.followUp(payload);
    } else {
        await interaction.reply(payload);
    }
}
