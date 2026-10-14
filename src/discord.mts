import { Client, Events } from 'discord.js';
import type { ClientOptions, Interaction } from 'discord.js';
import type { Gateway } from './contracts.mjs';

export function createDiscordGateway(options: ClientOptions): Gateway {
    const client = new Client(options);
    return {
        subscribe(event, reportError) {
            switch (event.name) {
                case 'clientReady': {
                    const listener = (): void => { event.execute().catch(reportError); };
                    if (event.once) client.once(Events.ClientReady, listener);
                    else client.on(Events.ClientReady, listener);
                    break;
                }
                case 'interactionCreate': {
                    const listener = (interaction: Interaction): void => {
                        event.execute(interaction.isChatInputCommand() ? interaction : null).catch(reportError);
                    };
                    if (event.once) client.once(Events.InteractionCreate, listener);
                    else client.on(Events.InteractionCreate, listener);
                    break;
                }
            }
        },
        login: token => client.login(token),
        destroy: () => client.destroy(),
    };
}
