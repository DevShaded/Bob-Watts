import { MessageFlags } from 'discord.js';
import type { CommandContext, CommandInteraction, CommandGuild, CommandUser } from './contracts.mjs';
import { authorizeSettings } from './settings.mjs';
import { serializeGuild, serializeGuildSettings, serializeUser } from './resource-serialization.mjs';

interface ModeratorDefinition {
    missing: (target: CommandUser) => string;
    removed: (target: CommandUser) => string;
    removedDM: (guild: CommandGuild) => string;
    level: number;
    added: (target: CommandUser) => string;
    updated: (target: CommandUser) => string;
    addedDM: (guild: CommandGuild) => string;
    updatedDM: (guild: CommandGuild) => string;
}
const definitions: ReadonlyMap<string, ModeratorDefinition> = new Map([
    ['softmoderator', { level: 3,
        missing: target => `<@${target.id}> is not a Soft Moderator in this server!`,
        removed: target => `<@${target.id}> has now been removed as Soft Moderator in this server`,
        removedDM: guild => `Your role as Soft Moderator has been removed in **${guild.name}**`,
        added: target => `<@${target.id}> is now a soft moderator of this server!`,
        updated: target => `<@${target.id}> has now been updated to soft moderator of this server!`,
        addedDM: guild => `You are now soft moderator in **${guild.name}** \n\n You can now use moderation commands like \`/warn\``,
        updatedDM: guild => `You have been updated to soft moderator in **${guild.name}** \n\n You can now use moderation commands like \`/warn\``,
    }],
    ['moderator', { level: 2,
        missing: target => `<@${target.id}> is not a Moderator in this server!`,
        removed: target => `<@${target.id}> has now been removed as Moderator in this server`,
        removedDM: guild => `Your role as Moderator has been removed in **${guild.name}**`,
        added: target => `<@${target.id}> is now a moderator of this server!`,
        updated: target => `<@${target.id}> has now been updated to moderator of this server!`,
        addedDM: guild => `You are now moderator in **${guild.name}** \n\n You can now use moderation commands like \`/ban\`,  \`/clean\`, \`/kick\`, \`/mute\`, \`/unban\`, \`/unmute\`, \`/warn\``,
        updatedDM: guild => `You have been updated to moderator in **${guild.name}** \n\n You can now use moderation commands like \`/ban\`,  \`/clean\`, \`/kick\`, \`/mute\`, \`/unban\`, \`/unmute\`, \`/warn\``,
    }],
    ['administrator', { level: 1,
        missing: target => `<@${target.id}> is not a Administrator in this server!`,
        removed: target => `<@${target.id}> has now been removed as Administrator in this server`,
        removedDM: guild => `Your role as Administrator has been removed in **${guild.name}**`,
        added: target => `<@${target.id}> is now an administrator of this server!`,
        updated: target => `<@${target.id}> has now been updated to administrator of this server!`,
        addedDM: guild => `You are now administrator in **${guild.name}** \n\n You can now use moderation commands like \`/ban\`,  \`/clean\`, \`/clearinfraction\`, \`/kick\`, \`/mute\`, \`/unban\`, \`/unmute\`, \`/warn\``,
        updatedDM: guild => `You have been updated to administrator in **${guild.name}** \n\n You can now use moderation commands like \`/ban\`, \`/clean\`, \`/clearinfraction\`, \`/kick\`, \`/mute\`, \`/unban\`, \`/unmute\`, \`/warn\``,
    }],
]);

export async function addModerator(interaction: CommandInteraction, context: CommandContext): Promise<void> {
    const prepared = await prepareModeratorChange(interaction, context);
    if (!prepared) return;
    const { guild, database, target, definition } = prepared;
    const where = { guildId: guild.id, accountId: target.id };
    const current = await database.moderators.findFirst({ where });
    if (current) await database.moderators.deleteMany({ where });
    await database.moderators.create({ data: { ...where, level: definition.level } });
    const footer = { text: interaction.client.user?.username ?? 'Bob Watts' };
    await interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [{
        color: 0x28a745, description: current ? definition.updated(target) : definition.added(target),
        timestamp: new Date().toISOString(), footer,
    }] });
    try {
        await target.send({ embeds: [{ color: 0xffc107,
            description: current ? definition.updatedDM(guild) : definition.addedDM(guild),
            timestamp: new Date().toISOString(), footer,
        }] });
    } catch (error) {
        console.log(`Failed to DM ${target.tag}`, error);
    }
}

async function prepareModeratorChange(interaction: CommandInteraction, context: CommandContext) {
    const authorized = await authorizeSettings(interaction, context);
    if (!authorized) return;
    const target = interaction.options.getUser('target');
    if (!target) {
        await interaction.reply({ content: "Sorry, I can't find this user!", flags: MessageFlags.Ephemeral });
        return;
    }
    const definition = definitions.get(interaction.options.getSubcommand());
    if (!definition) throw new Error('Unknown moderator level');
    const { guild, database } = authorized;
    if (!await database.users.findUnique({ where: { accountId: target.id } })) await database.users.create({ data: serializeUser(target) });
    if (!await database.guilds.findUnique({ where: { guildId: guild.id } })) {
        await database.guilds.create({ data: {
            ...serializeGuild(guild), GuildSettings: { create: serializeGuildSettings(guild) },
        } });
    }
    return { guild, database, target, definition };
}

export async function deleteModerator(interaction: CommandInteraction, context: CommandContext): Promise<void> {
    const prepared = await prepareModeratorChange(interaction, context);
    if (!prepared) return;
    const { guild, database, target, definition } = prepared;
    const where = { guildId: guild.id, accountId: target.id };
    const current = await database.moderators.findFirst({ where: { ...where, level: definition.level } });
    if (current) await database.moderators.deleteMany({ where });
    const footer = { text: interaction.client.user?.username ?? 'Bob Watts' };
    await interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [{
        color: current ? 0x28a745 : 0xff0033,
        description: current ? definition.removed(target) : definition.missing(target),
        timestamp: new Date().toISOString(), footer,
    }] });
    if (!current) return;
    try {
        await target.send({ embeds: [{ color: 0xffc107, description: definition.removedDM(guild),
            timestamp: new Date().toISOString(), footer,
        }] });
    } catch (error) {
        console.log(`Failed to DM ${target.tag}`, error);
    }
}
