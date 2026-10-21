import { respond } from './interaction-response.mjs';
import { serverinfo } from './commands/serverinfo.mjs';
import { createResourceEvents } from './events.mjs';
import type { SendLog, GetGuildInformation } from './event-resources.mjs';
import type { Persistence } from './persistence.mjs';
import { setSettings } from './commands/set.mjs';
import { removeSettings } from './commands/remove.mjs';
import { addModerator } from './commands/add.mjs';
import { deleteModerator } from './commands/delete.mjs';
import { ActivityType, MessageFlags } from 'discord.js';
import type { Command, CommandContext, HttpTransport, RegisteredEvent } from './contracts.mjs';
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
import { randomdog } from './commands/randomdog.mjs';
import { weather } from './commands/weather.mjs';
import { randomcat } from './commands/randomcat.mjs';

// Startup, registration, setup validation, and help share these definitions.
export const commands: readonly Command[] = [
    eightBall, coinflip, cookie, diceroll, hug, kiss, rps, slap,
    botinfo, help, ping, userinfo, serverinfo,
    ban, clean, clearinfractions, infractions, kick, mute, unban, unmute, vckick, warn,
    randomcat, randomdog, weather,
    setSettings, removeSettings, addModerator, deleteModerator,
];

export function createEvents({ commandRegistry, reportReady, reportError, http, weatherApi, persistence, sendLog, logGuildId, logChannelId, getGuildInformation, getDatabase, context = {} }: {
    persistence: Persistence;
    getGuildInformation?: GetGuildInformation | undefined;
    sendLog?: SendLog | undefined;
    logGuildId?: string | undefined;
    logChannelId?: string | undefined;
    getDatabase?: CommandContext['getDatabase'];
    http?: HttpTransport | undefined;
    weatherApi?: string | undefined;
    commandRegistry: readonly Command[];
    context?: Omit<CommandContext, 'commands'>;
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
                await command.execute(interaction, {
                    ...context, commands: commandRegistry, persistence, getGuildInformation,
                    ...(getDatabase ? { getDatabase } : {}),
                    ...(http ? { http } : {}), weatherApi,
                });
            } catch (error) {
                reportError(error);
                await respond(interaction, {
                    content: 'Well that didn\'t work, try another command maybe?', flags: MessageFlags.Ephemeral,
                });
            }
        },
    }];
}
