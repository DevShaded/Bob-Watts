import moment from 'moment';
import { MessageFlags } from 'discord.js';
import type { CommandContext, CommandInteraction, CommandGuild, CommandUser } from './contracts.mjs';
import type { SettingsDatabase } from './settings-database.mjs';
import { authorizeSettings } from './settings.mjs';
import { databaseEnums } from './database-enums.mjs';

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
    if (!await database.users.findUnique({ where: { accountId: target.id } })) await createUser(database, target);
    if (!await database.guilds.findUnique({ where: { guildId: guild.id } })) await createGuild(database, guild);
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

async function createUser(database: SettingsDatabase, target: CommandUser) {
    const createdTimestamp = moment(target.createdTimestamp).format('YYYY-MM-DD HH-mm-ss');

    await database.users.create({
        data: {
            accountId:        target.id,
            username:         target.username,
            discriminator:    target.discriminator,
            avatar:           target.avatarURL({ forceStatic: false }),
            bot:              target.bot,
            createdTimestamp: createdTimestamp
        }
    });
}

async function createGuild(database: SettingsDatabase, guild: CommandGuild) {
    const guildCreatedTimestamp = moment(guild.createdTimestamp).format('YYYY-MM-DD');

    const joinedTimestamp = moment(guild.joinedTimestamp).format('YYYY-MM-DD HH-mm-ss');

    await database.guilds.create({
        data: {
            guildId:                  guild.id,
            available:                guild.available,
            createdTimestamp:         guildCreatedTimestamp,
            joinedTimestamp:          joinedTimestamp,
            large:                    guild.large,
            maximumMembers:           guild.maximumMembers,
            maximumPresences:         guild.maximumPresences,
            memberCount:              guild.memberCount,
            partnered:                guild.partnered,
            premiumSubscriptionCount: guild.premiumSubscriptionCount,
            premiumTier:              databaseEnums.premiumTier[guild.premiumTier],
            verified:                 guild.verified,

            GuildSettings: {
                create: {
                    afkChannelID:                guild.afkChannelId,
                    afkTimeout:                  guild.afkTimeout,
                    bannerURL:                   guild.bannerURL({ forceStatic: false }),
                    defaultMessageNotifications: databaseEnums.defaultMessageNotifications[guild.defaultMessageNotifications],
                    description:                 guild.description,
                    explicitContentFilter:       databaseEnums.explicitContentFilter[guild.explicitContentFilter],
                    iconURL:                     guild.iconURL({ forceStatic: false }),
                    mfaLevel:                    databaseEnums.mfaLevel[guild.mfaLevel],
                    name:                        guild.name,
                    nameAcronym:                 guild.nameAcronym,
                    ownerID:                     guild.ownerId,
                    preferredLocale:             guild.preferredLocale,
                    rulesChannelID:              guild.rulesChannelId,
                    shardID:                     guild.shardId,
                    splashURL:                   guild.splashURL(),
                    systemChannelID:             guild.systemChannelId,
                    publicUpdatesChannelId:      guild.publicUpdatesChannelId,
                    vanityURLCode:               guild.vanityURLCode,
                    verificationLevel:           databaseEnums.verificationLevel[guild.verificationLevel]
                }
            }
        }
    });
}

export async function deleteModerator(interaction: CommandInteraction, context: CommandContext): Promise<void> {
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
    if (!await database.users.findUnique({ where: { accountId: target.id } })) await createUser(database, target);
    if (!await database.guilds.findUnique({ where: { guildId: guild.id } })) await createGuild(database, guild);
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
