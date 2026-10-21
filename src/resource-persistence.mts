import moment from 'moment';
import type { GuildState, UserState, MemberState, MessageState } from './event-resources.mjs';
import type { Persistence } from './persistence.mjs';
import { databaseEnums } from './database-enums.mjs';
import { serializeGuild, serializeGuildSettings, serializeUser } from './resource-serialization.mjs';

export async function saveGuild(persistence: Persistence, guild: GuildState): Promise<void> {
    if (!guild.available) return;
    await persistence.saveGuild(serializeGuild(guild), { guildId: guild.id, ...serializeGuildSettings(guild) });
}

export async function saveUser(persistence: Persistence, user: UserState): Promise<void> {
    await persistence.saveUser(serializeUser(user));
}

export async function saveMember(persistence: Persistence, member: MemberState): Promise<void> {
    if (!member.guild.available) return;
    await saveGuild(persistence, member.guild);
    await saveUser(persistence, member.user);
    await persistence.saveMember({
        guildId: member.guild.id, accountId: member.user.id, memberId: member.id,
        bannable: member.bannable, displayColor: member.displayColor,
        displayHexColor: member.displayHexColor, displayName: member.displayName,
        joinedTimestamp: member.joinedTimestamp === null ? null : moment(member.joinedTimestamp).format('YYYY-MM-DD HH-mm-ss'),
        kickable: member.kickable, manageable: member.manageable, nickname: member.nickname,
        premiumSinceTimestamp: member.premiumSinceTimestamp,
    });
}

export async function saveMessage(persistence: Persistence, message: MessageState): Promise<void> {
    const { guild, member, channel } = message;
    if (!guild?.available || !channel) return;
    await saveGuild(persistence, guild);
    await saveUser(persistence, message.author);
    if (member) await saveMember(persistence, member);
    await persistence.saveChannel({
        channelId: channel.id, name: channel.name, nsfw: 'nsfw' in channel ? channel.nsfw ?? false : false,
        topic: 'topic' in channel ? channel.topic ?? null : null, type: databaseEnums.channelType[channel.type],
        createdTimestamp: moment(channel.createdTimestamp).format('YYYY-MM-DD HH-mm-ss'),
    });
    if ('ownerId' in channel) {
        if (channel.ownerId) {
            const owner = channel.ownerId === message.author.id ? message.author : await message.fetchUser(channel.ownerId);
            if (owner) {
                await saveUser(persistence, owner);
                await persistence.saveThread({
                    threadId: channel.id, ownerId: owner.id, guildId: guild.id, threadName: channel.name,
                    archived: channel.archived, archivedAt: channel.archivedAt?.toISOString() ?? null,
                    archivedTimestamp: channel.archiveTimestamp === null ? null : moment(channel.archiveTimestamp).format('YYYY-MM-DD HH-mm-ss'),
                    autoArchiveDuration: channel.autoArchiveDuration,
                    createdTimestamp: moment(channel.createdTimestamp).format('YYYY-MM-DD HH-mm-ss'),
                    editable: channel.editable, invitable: channel.invitable, joinable: channel.joinable,
                    joined: channel.joined, locked: channel.locked ?? false, manageable: channel.manageable,
                    memberCount: channel.memberCount ?? 0, type: databaseEnums.channelType[channel.type],
                    unarchivable: channel.unarchivable,
                });
            }
        }
    } else await persistence.saveGuildChannel({
        guildId: guild.id, channelId: channel.id, name: channel.name,
        deletable: channel.deletable, manageable: channel.manageable, parentId: channel.parentId,
        permissionsLocked: channel.permissionsLocked, position: channel.position,
        rawPosition: channel.rawPosition, viewable: channel.viewable,
    });
    await persistence.saveMessage({
        messageId: message.id, guildId: guild.id, channelId: channel.id,
        accountId: message.author.id, content: message.content, url: message.url,
    }, channel.name);
}
