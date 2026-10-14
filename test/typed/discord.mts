import type { InteractionEditReplyOptions, InteractionReplyOptions } from 'discord.js';
import type { CommandInteraction, Gateway, RegisteredEvent } from '../../src/contracts.mjs';

export class OfflineGateway implements Gateway {
    readonly events: RegisteredEvent[] = [];
    readonly tokens: string[] = [];
    destroyed = false;

    subscribe(event: RegisteredEvent): void {
        this.events.push(event);
    }

    login(token: string): Promise<string> {
        this.tokens.push(token);
        return Promise.resolve(token);
    }

    destroy(): Promise<void> {
        this.destroyed = true;
        return Promise.resolve();
    }

    async dispatch(interaction: CommandInteraction | null): Promise<void> {
        for (const event of [...this.events]) {
            if (event.name !== 'interactionCreate') continue;
            if (event.once) this.events.splice(this.events.indexOf(event), 1);
            await event.execute(interaction);
        }
    }

    async ready(): Promise<void> {
        for (const event of [...this.events]) {
            if (event.name !== 'clientReady') continue;
            if (event.once) this.events.splice(this.events.indexOf(event), 1);
            await event.execute();
        }
    }
}

export class OfflineInteraction implements CommandInteraction {
    commandName = 'ping';
    client = { ws: { ping: 42 }, user: { username: 'Test bot' } };
    deferred = false;
    replied = false;
    replyFailure: Error | undefined;
    readonly responses: {
        method: 'reply' | 'editReply' | 'followUp';
        payload: InteractionReplyOptions | InteractionEditReplyOptions;
    }[] = [];

    reply(payload: InteractionReplyOptions): Promise<void> {
        if (this.replyFailure) {
            const error = this.replyFailure;
            this.replyFailure = undefined;
            return Promise.reject(error);
        }
        this.responses.push({ method: 'reply', payload });
        this.replied = true;
        return Promise.resolve();
    }

    editReply(payload: InteractionEditReplyOptions): Promise<void> {
        this.responses.push({ method: 'editReply', payload });
        return Promise.resolve();
    }

    followUp(payload: InteractionReplyOptions): Promise<void> {
        this.responses.push({ method: 'followUp', payload });
        return Promise.resolve();
    }
}

export const startupEnvironment = {
    APP_ENV: 'development', APP_TOKEN: 'offline-token',
    APP_GUILD_ID: '456', APP_CHANNEL_ID: '789',
    DATABASE_URL: 'mysql://offline:offline@127.0.0.1:1/offline',
};
