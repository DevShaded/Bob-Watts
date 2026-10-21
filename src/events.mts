import { ButtonStyle, ComponentType } from 'discord.js';
import { saveGuild, saveMember, saveMessage } from './resource-persistence.mjs';
import type { RegisteredEvent } from './contracts.mjs';
import type { SendLog, UserState } from './event-resources.mjs';
import type { Persistence } from './persistence.mjs';

export function createResourceEvents(options: {
    persistence: Persistence;
    username?: () => string;
    sendLog?: SendLog | undefined;
    logGuildId?: string | undefined;
    logChannelId?: string | undefined;
    reportError: (error: unknown) => void;
}): readonly RegisteredEvent[] {
    async function memberLog(guildId: string, channelId: string | null | undefined, user: UserState | null, description: string, color: number): Promise<void> {
        if (!channelId || !user || !options.sendLog) return;
        await options.sendLog(guildId, channelId, { embeds: [{
            color, author: { name: `${user.tag} (${user.id})`, icon_url: user.displayAvatarURL() },
            description, timestamp: new Date().toISOString(), footer: { text: 'Bob Watts' },
        }] });
    }
    async function guildLog(description: string, color: number): Promise<void> {
        if (!options.logGuildId || !options.logChannelId || !options.sendLog) return;
        await options.sendLog(options.logGuildId, options.logChannelId, { embeds: [{
            color, description, timestamp: new Date().toISOString(), footer: { text: options.username?.() ?? 'Bob Watts' },
        }] });
    }
    return [
        { name: 'guildCreate', once: false, async execute(guild) {
            if (!guild.available) return;
            await saveGuild(options.persistence, guild);
            await guildLog(`I have joined **${guild.name}**`, 0x28a745);
        } },
        { name: 'guildDelete', once: false, execute: guild => guildLog(`I have left **${guild.name}**`, 0xdc3545) },
        { name: 'guildUnavailable', once: false, async execute(guild) {
            await options.persistence.unavailableGuild(guild.id);
            await guildLog(`**${guild.name}** is now unavailable`, 0xdc3545);
        } },
        { name: 'guildUpdate', once: false, async execute(oldGuild, guild) {
            if (!guild.available) return;
            await saveGuild(options.persistence, guild);
            await guildLog(`Somebody has updated **${oldGuild.name}** new name **${guild.name}**`, 0x28a745);
        } },
        { name: 'guildMemberAdd', once: false, async execute(member) {
            if (!member.guild.available) return;
            await saveMember(options.persistence, member);
            const logs = await options.persistence.guildLogs(member.guild.id);
            try {
                await memberLog(member.guild.id, logs?.welcome_log, member.user, logs?.welcome_message || 'Joined the server', 0x28a745);
            } catch (error) { options.reportError(error); }
            if (logs?.join_role && member.roles.cache.has(logs.join_role)) await member.roles.add(logs.join_role);
        } },
        { name: 'guildMemberRemove', once: false, async execute(member) {
            if (!member.guild.available) return;
            // Update the member count when a user leaves the guild.
            await options.persistence.updateMemberCount(member.guild.id, member.guild.memberCount);
            const logs = await options.persistence.guildLogs(member.guild.id);
            await memberLog(member.guild.id, logs?.goodbye_log, member.user, logs?.goodbye_message || 'Left the server', 0xdc3545);
        } },
        { name: 'guildMemberUpdate', once: false, execute: (_oldMember, member) => saveMember(options.persistence, member) },
        { name: 'messageCreate', once: false, async execute(message) {
            if (message.author.bot || message.webhookId) return;
            await saveMessage(options.persistence, message);
            if (!message.content.startsWith('!help')) return;
            await message.reply({ embeds: [{
                color: 0x17a2b8, title: 'Announcement',
                description: 'As of <t:1654293600:F>, the Bob Watts dev team has decided to remove message commands, and replaced them with slash commands. If you can\'t find any slash commands from Bob Watts, then you need to re-add the bot to the server!',
                timestamp: new Date().toISOString(), footer: { text: options.username?.() ?? 'Bob Watts' },
            }], components: [{ type: ComponentType.ActionRow, components: [{ type: ComponentType.Button, style: ButtonStyle.Link, url: 'https://devshaded.com/bobwatts', label: 'Invite Link' }] }] });
        } },
    ];
}
