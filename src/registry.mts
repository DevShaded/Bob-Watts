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
import { kick } from './commands/kick.mjs';
import { unban } from './commands/unban.mjs';
import { warn } from './commands/warn.mjs';
import { mute } from './commands/mute.mjs';
import { unmute } from './commands/unmute.mjs';
import { vckick } from './commands/vckick.mjs';
import { clean } from './commands/clean.mjs';
import { infractions } from './commands/infractions.mjs';
import { clearinfractions } from './commands/clearinfractions.mjs';
import { ban } from './commands/ban.mjs';
import { userinfo } from './commands/userinfo.mjs';

// Migration checkpoint: remaining commands join this explicit registry in #30–33.
export const commands: readonly Command[] = [
    eightBall, coinflip, cookie, diceroll, hug, kiss, rps, slap,
    botinfo, help, ping, userinfo, ban, clearinfractions, infractions, clean, vckick, unmute, mute, warn, unban, kick,
];

export function createEvents({ commandRegistry, reportReady, reportError, context = {} }: {
    commandRegistry: readonly Command[];
    context?: Omit<CommandContext, 'commands'>;
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
                await command.execute(interaction, { ...context, commands: commandRegistry });
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
