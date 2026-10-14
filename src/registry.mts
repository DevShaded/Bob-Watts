import { MessageFlags } from 'discord.js';
import type { Command, RegisteredEvent } from './contracts.mjs';
import { ping } from './commands/ping.mjs';

// Migration checkpoint: remaining commands join this explicit registry in #29–33.
export const commands: readonly Command[] = [ping];

export function createEvents({ reportReady, reportError }: {
    reportReady: () => void;
    reportError: (error: unknown) => void;
}): readonly RegisteredEvent[] {
    const byName = new Map(commands.map(command => [command.data.toJSON().name, command]));
    return [{
        name: 'clientReady',
        once: true,
        execute: () => {
            reportReady();
            return Promise.resolve();
        },
    }, {
        name: 'interactionCreate',
        once: false,
        async execute(interaction) {
            if (!interaction) return;
            const command = byName.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                reportError(error);
                const response = { content: 'Well that didn\'t work, try another command maybe?' };
                if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply(response);
                } else if (interaction.replied) {
                    await interaction.followUp({ ...response, flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ ...response, flags: MessageFlags.Ephemeral });
                }
            }
        },
    }];
}
