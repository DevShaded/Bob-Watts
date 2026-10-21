import { setSettings } from './commands/set.mjs';
import { removeSettings } from './commands/remove.mjs';
import { addModerator } from './commands/add.mjs';
import { deleteModerator } from './commands/delete.mjs';
import { MessageFlags } from 'discord.js';
import type { Command, CommandContext, RegisteredEvent } from './contracts.mjs';
import { ping } from './commands/ping.mjs';
import { coinflip } from './commands/coinflip.mjs';
import { eightBall } from './commands/8ball.mjs';
import { cookie } from './commands/cookie.mjs';
import { diceroll } from './commands/diceroll.mjs';
import { hug } from './commands/hug.mjs';
import { kiss } from './commands/kiss.mjs';
import { slap } from './commands/slap.mjs';
import { rps } from './commands/rps.mjs';
import { help } from './commands/help.mjs';
import { botinfo } from './commands/botinfo.mjs';
import { userinfo } from './commands/userinfo.mjs';

// Migration checkpoint: remaining commands join this explicit registry in #30–33.
export const commands: readonly Command[] = [
    eightBall, coinflip, cookie, diceroll, hug, kiss, rps, slap,
    botinfo, help, ping, userinfo,
    setSettings, removeSettings, addModerator, deleteModerator,
];

export function createEvents({ commandRegistry, reportReady, reportError, getDatabase }: {
    getDatabase?: CommandContext['getDatabase'];
    commandRegistry: readonly Command[];
    reportReady: () => void;
    reportError: (error: unknown) => void;
}): readonly RegisteredEvent[] {
    const byName = new Map(commandRegistry.map(command => [command.data.toJSON().name, command]));
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
                await command.execute(interaction, { commands: commandRegistry, ...(getDatabase ? { getDatabase } : {}) });
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
