import { serverinfo } from './commands/serverinfo.mjs';
import { createResourceEvents } from './events.mjs';
import type { SendLog, GetGuildInformation } from './event-resources.mjs';
import type { Persistence } from './persistence.mjs';
import { ActivityType, MessageFlags } from 'discord.js';
import type { Command, HttpTransport, RegisteredEvent } from './contracts.mjs';
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
import { randomdog } from './commands/randomdog.mjs';
import { weather } from './commands/weather.mjs';
import { randomcat } from './commands/randomcat.mjs';

// Migration checkpoint: remaining commands join this explicit registry in #30–33.
export const commands: readonly Command[] = [
    eightBall, coinflip, cookie, diceroll, hug, kiss, rps, slap,
    botinfo, help, ping, userinfo, serverinfo,
    randomcat, randomdog, weather,
];

export function createEvents({ commandRegistry, reportReady, reportError, http, weatherApi, persistence, sendLog, logGuildId, logChannelId, getGuildInformation }: {
    persistence: Persistence;
    getGuildInformation?: GetGuildInformation | undefined;
    sendLog?: SendLog | undefined;
    logGuildId?: string | undefined;
    logChannelId?: string | undefined;
    http?: HttpTransport | undefined;
    weatherApi?: string | undefined;
    commandRegistry: readonly Command[];
    reportReady: () => void;
    reportError: (error: unknown) => void;
}): readonly RegisteredEvent[] {
    let username = 'Bob Watts';
    const byName = new Map(commandRegistry.map(command => [command.data.toJSON().name, command]));
    return [...createResourceEvents({ persistence, sendLog, logGuildId, logChannelId, reportError, username: () => username }), {
        name: 'clientReady',
        once: true,
        async execute(client) {
            reportReady();
            if (!client) return;
            username = client.username;
            const activity = await persistence.activity();
            const types: Readonly<Record<string, ActivityType>> = {
                PLAYING: ActivityType.Playing, STREAMING: ActivityType.Streaming,
                LISTENING: ActivityType.Listening, WATCHING: ActivityType.Watching,
                CUSTOM: ActivityType.Custom, COMPETING: ActivityType.Competing,
            };
            client.setActivity(activity?.name ?? 'devshaded.com/bobwatts', {
                type: activity ? types[activity.type] ?? ActivityType.Playing : ActivityType.Watching,
                ...(activity?.url ? { url: activity.url } : {}),
            });
        },
    }, {
        name: 'interactionCreate',
        once: false,
        async execute(interaction) {
            if (!interaction) return;
            const command = byName.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, { commands: commandRegistry, persistence, getGuildInformation, ...(http ? { http } : {}), weatherApi });
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
