import type { ModerationDatabase, ModerationMember } from './moderation-contracts.mjs';
import type { APIEmbed } from 'discord.js';
import { MessageFlags, PermissionFlagsBits } from 'discord.js';
import type { CommandContext, CommandGuild, CommandInteraction } from './contracts.mjs';
import type { ModeratorLevel } from './moderator-level.mjs';
import { verifyModeratorLevel } from './moderator-level.mjs';
import { serializeUser } from './resource-serialization.mjs';
import { respond } from './interaction-response.mjs';

export async function executeModeration(interaction: CommandInteraction, context: CommandContext): Promise<void> {
    const guild = interaction.guild;
    if (!guild) {
        await respond(interaction, { content: 'This command can only be used in a server!', flags: MessageFlags.Ephemeral });
        return;
    }
    if (!context.database) throw new Error('Moderation dependencies unavailable');
    const executor = await guild.members.fetch(interaction.user.id);
    const database = context.database();
    const policy = moderationPolicies.get(interaction.commandName);
    if (!policy) throw new Error(`Unknown moderation command: ${interaction.commandName}`);
    const action = policy.action;
    if (!executor || (!executor.permissions.has(policy.permission)
        && !await verifyModeratorLevel(database.moderators, { guildId: guild.id, accountId: interaction.user.id }, policy.level))) {
        await respond(interaction, {
            content: `You do not have permission to **${policy.permissionName}**, so you can't run this command!`,
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
    if (action === 'unban') {
        const id = interaction.options.getString('target');
        const user = id ? await database.users.findUnique({ where: { accountId: id } }) : null;
        if (!user) {
            await respond(interaction, { content: 'This user could not be found!', flags: MessageFlags.Ephemeral });
            return;
        }
        const settings = await database.guildLogs.findUnique({ where: { guildId: guild.id } });
        const logId = settings?.infractions_log;
        const log = logId ? guild.channels?.cache.get(logId) : undefined;
        if (logId && !log?.send) {
            await respond(interaction, { embeds: [errorEmbed(interaction, "I could not find the infraction channel you have setup! Make sure it's setup correctly")], flags: MessageFlags.Ephemeral });
            return;
        }
        if (!guild.members.unban) throw new Error('Unban unavailable');
        try {
            await guild.members.unban(user.accountId);
        } catch (error) {
            if (typeof error !== 'object' || error === null || !('code' in error) || error.code !== 10026) throw error;
            await respond(interaction, { embeds: [embed(interaction, `Cannot unban <@${user.accountId}>, because that user is not banned from this server!`)], flags: MessageFlags.Ephemeral });
            return;
        }
        await database.infractions.create({ data: { guildId: guild.id, accountId: user.accountId, reason: 'No reason for unban', type: 'unban', expires: null } });
        const details = embed(interaction, 'This user has been unbanned!');
        details.author = { name: `${user.username ?? user.accountId}#${user.discriminator ?? '0'}` };
        if (user.avatar) details.author.icon_url = user.avatar;
        details.fields = [{ name: 'Issued By', value: `<@${interaction.user.id}>`, inline: false },
            ...(logId ? [{ name: 'Action', value: 'Unban', inline: true }] : []),
            { name: 'User ID', value: user.accountId, inline: true }];
        if (log?.send) await log.send({ embeds: [details] });
        await respond(interaction, { embeds: [logId ? { ...details, description: 'That user has been unbanned!' } : details], ...(logId ? { flags: MessageFlags.Ephemeral } : {}) });
        return;
    }
    const targetUser = interaction.options.getUser('target');
    if (!targetUser) {
        await respond(interaction, { content: "Sorry! I can't find this user!", flags: MessageFlags.Ephemeral });
        return;
    }
    const target = await context.getModerationMember?.(guild.id, targetUser.id);
    if (!target) {
        await respond(interaction, { content: "Sorry! I can't find this user!", flags: MessageFlags.Ephemeral });
        return;
    }
    const ineligible = typeof action === 'object' ? action.ineligible?.(target, interaction.client.user?.id) : undefined;
    if (ineligible) {
        await respond(interaction, { embeds: [errorEmbed(interaction, ineligible)], flags: MessageFlags.Ephemeral });
        return;
    }
    const selfDenial = policy.selfDenial;
    if (selfDenial && target.id === interaction.client.user?.id) {
        await respond(interaction, { embeds: [errorEmbed(interaction, selfDenial)], flags: MessageFlags.Ephemeral });
        return;
    }
    if (action === 'list') {
        const records = await database.infractions.findMany({ where: { guildId: guild.id, accountId: target.id } });
        const author = { name: target.user.tag, icon_url: target.user.displayAvatarURL() };
        if (!records.length) {
            await respond(interaction, { embeds: [{ ...embed(interaction, `<@${target.id}> has no infractions.`), author, color: 0x28a745 }], flags: MessageFlags.Ephemeral });
            return;
        }
        const text = records.map(row => `\`\`\`${row.type}: ${row.reason}\`\`\``).join(' ');
        const fields = [];
        for (let offset = 0; offset < text.length; offset += 1024) {
            fields.push({ name: offset === 0 ? `Infractions (${String(records.length)})` : 'Continued', value: text.slice(offset, offset + 1024), inline: false });
        }
        // Five fields leave room for author/footer text under Discord's 6000 character total.
        for (let offset = 0; offset < fields.length; offset += 5) {
            await respond(interaction, { embeds: [{ ...embed(interaction), author, thumbnail: { url: target.displayAvatarURL({ forceStatic: false }) }, fields: fields.slice(offset, offset + 5) }], flags: MessageFlags.Ephemeral });
        }
        return;
    }
    const settings = await database.guildLogs.findUnique({ where: { guildId: guild.id } });
    const logId = settings?.infractions_log;
    const log = logId ? guild.channels?.cache.get(logId) : undefined;
    if (logId && !log?.send) {
        await respond(interaction, { embeds: [errorEmbed(interaction, "I could not find the infraction channel you have setup! Make sure it's setup correctly")], flags: MessageFlags.Ephemeral });
        return;
    }
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger?.('days') ?? 0;
    if (typeof action === 'object' && action.validDays && !action.validDays(days)) {
        await respond(interaction, { content: 'Please provide a valid number of days.', flags: MessageFlags.Ephemeral });
        return;
    }
    const user = target.user;
    if (!await database.users.findUnique({ where: { accountId: user.id } })) {
        await database.users.create({ data: serializeUser(user) });
    }
    if (action === 'clear') {
        const amount = Math.max(1, interaction.options.getInteger?.('amount') ?? 1);
        const records = await database.infractions.findMany({ where: { guildId: guild.id, accountId: target.id }, orderBy: [{ id: 'desc' }], take: amount });
        if (!records.length) {
            await respond(interaction, { embeds: [errorEmbed(interaction, 'There are no infraction stored for this user!')], flags: MessageFlags.Ephemeral });
            return;
        }
        for (const row of records) await database.infractions.delete({ where: { id: row.id } });
        const details = embed(interaction, `${String(records.length)} infractions from <@${target.id}> has been successfully removed!`);
        details.title = 'Successfully removed infractions!';
        details.color = 0x00ff00;
        if (log?.send) {
            await log.send({ embeds: [actionDetails(interaction, target, 'Successfully removed infractions!', reason, policy.label)] });
        }
        await respond(interaction, { embeds: [details], flags: MessageFlags.Ephemeral });
        if (log?.send) {
            await notify(interaction, context, target, `${String(records.length)} of your infractions in **${guild.name}** have been removed for the following reason(s): \n\n${reason}`);
        }
        return;
    }
    if (action === 'clean') {
        const channel = interaction.channel;
        if (!channel?.messages || !interaction.deferReply) {
            await respond(interaction, { content: 'Cannot clean messages in this channel!', flags: MessageFlags.Ephemeral });
            return;
        }
        const amount = Math.max(1, interaction.options.getInteger?.('amount') ?? 1);
        const messages = await database.messages.findMany({
            where: { guildId: guild.id, channelId: channel.id, accountId: target.id },
            orderBy: [{ id: 'desc' }], take: amount,
        });
        if (!messages.length) {
            await respond(interaction, { content: 'Could not delete these messages because those messages arent stored in my database!', flags: MessageFlags.Ephemeral });
            return;
        }
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        let deleted = 0;
        for (const row of messages) {
            const message = await channel.messages.fetch(row.messageId);
            await message.delete();
            await database.channelMessages.deleteMany({ where: { messageId: row.messageId } });
            await database.messages.deleteMany({ where: { messageId: row.messageId } });
            deleted++;
        }
        const details = embed(interaction, `${String(deleted)} messages from <@${target.id}> has been successfully deleted`);
        details.title = 'Successfully deleted messages!';
        details.color = 0x00ff00;
        if (log?.send) {
            await database.infractions.create({ data: { guildId: guild.id, accountId: target.id, reason, type: 'clean', expires: null } });
            await log.send({ embeds: [actionDetails(interaction, target, 'Successfully deleted messages!', reason, policy.label)] });
        }
        await respond(interaction, { embeds: [details] });
        if (log?.send) {
            await notify(interaction, context, target, `${String(deleted)} of your messages in **${guild.name}** have been deleted for the following reason(s): \n\n${reason}`);
        }
        return;
    }
    const result = await action.execute({ interaction, context, guild, target, reason, days, settings });
    if (!result) return;
    await database.infractions.create({ data: {
        guildId: guild.id, accountId: target.id, reason, type: action.infractionType, expires: result.expires ?? null,
    } });
    const description = result.description ?? `This user has been ${policy.verb}!`;
    const details = actionDetails(interaction, target, description, reason, logId ? policy.label : undefined);
    if (log?.send) await log.send({ embeds: [details] });
    await respond(interaction, {
        embeds: [logId ? { ...embed(interaction, `That user has been ${result.confirmationVerb ?? policy.verb}!`), author: { name: user.tag, icon_url: target.displayAvatarURL({ forceStatic: false }) } } : details],
        ...(logId && !result.publicLoggedReply ? { flags: MessageFlags.Ephemeral } : {}),
    });
    if (result.notification && (result.notification.withoutLog || logId)) {
        await notify(interaction, context, target, `You have been ${result.notification.verb} in **${guild.name}** for the following reason(s): \n\n${reason}`);
    }
}

function embed(interaction: CommandInteraction, description?: string): APIEmbed {
    return { color: 0xff9900, ...(description ? { description } : {}), timestamp: new Date().toISOString(), footer: { text: interaction.client.user?.username ?? 'Bob Watts' } };
}

function scheduleModeration(delayMs: number, action: () => Promise<void>): void {
    // Node timers overflow beyond 2^31-1 ms. Split longer mute durations.
    const interval = Math.min(delayMs, 2147483647);
    const timer = setTimeout(() => {
        if (delayMs > interval) scheduleModeration(delayMs - interval, action);
        else void action();
    }, interval);
    timer.unref();
}

async function notify(interaction: CommandInteraction, context: CommandContext, target: ModerationMember, description: string): Promise<void> {
    try {
        await target.send({ embeds: [{ ...embed(interaction, description.slice(0, 4096)), color: 0xffc107 }] });
    } catch (error) { context.reportError?.(error); }
}

interface MemberActionContext {
    readonly interaction: CommandInteraction;
    readonly context: CommandContext;
    readonly guild: CommandGuild;
    readonly target: ModerationMember;
    readonly reason: string;
    readonly days: number;
    readonly settings: Awaited<ReturnType<ModerationDatabase['guildLogs']['findUnique']>>;
}

interface MemberActionResult {
    readonly description?: string;
    readonly confirmationVerb?: string;
    readonly expires?: string;
    readonly publicLoggedReply?: boolean;
    readonly notification?: { readonly verb: string; readonly withoutLog?: boolean };
}

interface MemberAction {
    readonly infractionType: string;
    readonly ineligible?: (target: ModerationMember, botId: string | undefined) => string | undefined;
    readonly validDays?: (days: number) => boolean;
    execute(options: MemberActionContext): Promise<MemberActionResult | null>;
}

type ModerationAction = 'unban' | 'clean' | 'clear' | 'list' | MemberAction;

function validDuration(days: number): boolean {
    return Number.isSafeInteger(days) && days >= 0 && Number.isSafeInteger(days * 86400000);
}

async function setMute({ interaction, context, guild, target, days, settings }: MemberActionContext, muted: boolean): Promise<MemberActionResult | null> {
    const role = settings?.mute_role;
    if (!role) {
        await respond(interaction, { embeds: [errorEmbed(interaction, 'This server has not setup a mute role. Set one up with `/set muterole`')], flags: MessageFlags.Ephemeral });
        return null;
    }
    if (target.roles.cache.has(role) === muted) {
        await respond(interaction, { content: muted ? 'It looks like this user is already muted!' : 'It looks like this user is not muted!', flags: MessageFlags.Ephemeral });
        return null;
    }
    if (muted) await target.roles.add(role);
    else await target.roles.remove(role);
    const timed = muted && days > 0;
    if (timed) {
        const schedule = context.schedule ?? scheduleModeration;
        schedule(days * 86400000, async () => {
            try {
                await target.roles.remove(role);
                await notify(interaction, context, target, `Your mute cool down is finished in **${guild.name}**`);
            } catch (error) { context.reportError?.(error); }
        });
    }
    return {
        ...(timed ? { expires: `${String(days)} day(s)` } : {}),
        publicLoggedReply: timed,
        notification: { verb: muted ? 'muted' : 'unmuted', withoutLog: true },
    };
}

interface ModerationPolicy {
    readonly action: ModerationAction;
    readonly permission: bigint;
    readonly permissionName: string;
    readonly level: ModeratorLevel;
    readonly label: string;
    readonly verb: string;
    readonly selfDenial?: string;
}

const manageMessages = { permission: PermissionFlagsBits.ManageMessages, permissionName: 'MANAGE_MESSAGES', level: 2 } satisfies Pick<ModerationPolicy, 'permission' | 'permissionName' | 'level'>;
const banMembers = { permission: PermissionFlagsBits.BanMembers, permissionName: 'BAN_MEMBERS', level: 2 } satisfies Pick<ModerationPolicy, 'permission' | 'permissionName' | 'level'>;
const moderationPolicies = new Map<string, ModerationPolicy>([
    ['ban', { ...banMembers, label: 'Ban', verb: 'banned', action: {
        infractionType: 'ban', validDays: days => validDuration(days) && days <= 7,
        ineligible: (target, botId) => !target.bannable || target.id === botId ? 'This user is not bannable!' : undefined,
        async execute({ target, reason, days }) {
            await target.ban({ reason, deleteMessageSeconds: days * 86400 });
            return {};
        },
    } }],
    ['unban', { action: 'unban', ...banMembers, label: 'Unban', verb: 'unbanned' }],
    ['kick', { permission: PermissionFlagsBits.KickMembers, permissionName: 'KICK_MEMBERS', level: 2, label: 'Kick', verb: 'kicked', action: {
        infractionType: 'kick',
        ineligible: (target, botId) => !target.kickable || target.id === botId ? 'This user is not kickable!' : undefined,
        async execute({ target, reason }) {
            await target.kick(reason);
            return {};
        },
    } }],
    ['clean', { action: 'clean', ...manageMessages, label: 'Clean', verb: 'cleaned', selfDenial: 'Cannot clear messages from this user!' }],
    ['clearinfractions', { action: 'clear', permission: PermissionFlagsBits.Administrator, permissionName: 'ADMINISTRATOR', level: 1, label: 'Clear Infractions', verb: 'cleared', selfDenial: 'Cannot clear infractions from this user!' }],
    ['infractions', { action: 'list', ...manageMessages, level: 3, label: 'Infractions', verb: 'listed', selfDenial: 'Cannot get infractions from this user!' }],
    ['mute', { ...manageMessages, label: 'Mute', verb: 'muted', selfDenial: 'This user is not mutable!', action: {
        infractionType: 'mute', validDays: validDuration,
        execute: options => setMute(options, true),
    } }],
    ['unmute', { ...manageMessages, label: 'Unmute', verb: 'unmuted', action: {
        infractionType: 'unmute', execute: options => setMute(options, false),
    } }],
    ['warn', { ...manageMessages, level: 3, label: 'Warning', verb: 'warned', action: {
        infractionType: 'warning', execute: () => Promise.resolve({ notification: { verb: 'warned' } }),
    } }],
    ['vckick', { permission: PermissionFlagsBits.MoveMembers, permissionName: 'MOVE_MEMBERS', level: 2, label: 'Voice channel kick', verb: 'kicked', action: {
        infractionType: 'vckick',
        async execute({ interaction, target, reason }) {
            const voiceId = target.voice.channel?.id;
            if (!voiceId) {
                await respond(interaction, { embeds: [errorEmbed(interaction, `<@${target.id}> is not in a voice channel!`)], flags: MessageFlags.Ephemeral });
                return null;
            }
            await target.voice.disconnect(reason);
            return {
                description: `This user has been kicked from <#${voiceId}>`,
                confirmationVerb: 'kicked from the voice channel', notification: { verb: 'kicked from the voice channel' },
            };
        },
    } }],
]);

function actionDetails(interaction: CommandInteraction, target: ModerationMember, description: string, reason: string, action?: string): APIEmbed {
    const fields = [{ name: 'Issued By', value: `<@${interaction.user.id}>`, inline: false }];
    if (action) fields.push({ name: 'Action', value: action, inline: true });
    fields.push({ name: 'User ID', value: action ? `\`${target.id}\`` : target.id, inline: true });
    if (action) fields.push({ name: 'Joined At', value: target.joinedAt ? `<t:${String(Math.floor(target.joinedAt.getTime() / 1000))}:R>` : 'Unknown', inline: true });
    fields.push({ name: 'Reason', value: `${reason}\n`.slice(0, 1024), inline: false });
    const avatar = target.displayAvatarURL({ forceStatic: false });
    return { ...embed(interaction, description), author: { name: target.user.tag, icon_url: avatar }, thumbnail: { url: avatar }, fields };
}

function errorEmbed(interaction: CommandInteraction, description: string): APIEmbed {
    return { ...embed(interaction, description), color: 0xff0000 };
}
