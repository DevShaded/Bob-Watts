import { Client, Events } from 'discord.js';
import type { ClientOptions, Interaction, ClientEvents } from 'discord.js';
import type { Gateway } from './contracts.mjs';

export function createDiscordGateway(options: ClientOptions): Gateway {
    const client = new Client(options);
    function listen<Name extends keyof ClientEvents>(name: Name, once: boolean, listener: (...args: ClientEvents[Name]) => void): void {
        if (once) client.once(name, listener);
        else client.on(name, listener);
    }
    return {
        async getModerationMember(guildId, userId) {
            const guild = client.guilds.cache.get(guildId);
            return guild ? guild.members.fetch(userId) : null;
        },
        async getGuildInformation(guildId) {
            const guild = client.guilds.cache.get(guildId);
            if (!guild?.available) return null;
            const members = await guild.members.fetch({ withPresences: true });
            const onlineMembers = members.filter(member => member.presence?.status === 'online' || member.presence?.status === 'dnd').size;
            return { guild, onlineMembers, roleIds: [...guild.roles.cache.keys()] };
        },
        async sendLog(guildId, channelId, options) {
            const channel = client.guilds.cache.get(guildId)?.channels.cache.get(channelId);
            if (channel?.isSendable()) await channel.send(options);
        },
        subscribe(event, reportError) {
            switch (event.name) {
                case 'clientReady': {
                    const listener = (): void => {
                        if (!client.user) return;
                        const user = client.user;
                        event.execute({ username: user.username, setActivity: (name, activity) => user.setActivity(name, activity) }).catch(reportError);
                    };
                    if (event.once) client.once(Events.ClientReady, listener);
                    else client.on(Events.ClientReady, listener);
                    break;
                }
                case 'guildCreate':
                    listen(Events.GuildCreate, event.once, guild => { event.execute(guild).catch(reportError); });
                    break;
                case 'guildDelete':
                    listen(Events.GuildDelete, event.once, guild => { event.execute(guild).catch(reportError); });
                    break;
                case 'guildUnavailable':
                    listen(Events.GuildUnavailable, event.once, guild => { event.execute(guild).catch(reportError); });
                    break;
                case 'guildUpdate':
                    listen(Events.GuildUpdate, event.once, (oldGuild, guild) => { event.execute(oldGuild, guild).catch(reportError); });
                    break;
                case 'guildMemberAdd':
                    listen(Events.GuildMemberAdd, event.once, member => { event.execute(member).catch(reportError); });
                    break;
                case 'guildMemberRemove':
                    listen(Events.GuildMemberRemove, event.once, member => { event.execute(member).catch(reportError); });
                    break;
                case 'guildMemberUpdate':
                    listen(Events.GuildMemberUpdate, event.once, (oldMember, member) => { event.execute(oldMember, member).catch(reportError); });
                    break;
                case 'messageCreate':
                    listen(Events.MessageCreate, event.once, message => {
                        event.execute({
                            id: message.id, author: message.author, webhookId: message.webhookId,
                            content: message.content, url: message.url, guild: message.guild,
                            member: message.member, channel: message.channel.isDMBased() ? null : message.channel,
                            fetchUser: id => client.users.fetch(id),
                            reply: options => message.reply(options),
                        }).catch(reportError);
                    });
                    break;
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
