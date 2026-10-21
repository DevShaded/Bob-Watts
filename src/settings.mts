import { settingDefinitions } from './settings-definitions.mjs';
import { ChannelType, MessageFlags, PermissionFlagsBits } from 'discord.js';
import type { CommandContext, CommandInteraction, CommandGuild } from './contracts.mjs';
import type { SettingsDatabase } from './settings-database.mjs';
import { verifyModeratorLevel } from './moderator-level.mjs';

export async function authorizeSettings(interaction: CommandInteraction, context: CommandContext): Promise<{
    guild: CommandGuild; database: SettingsDatabase;
} | null> {
    if (!interaction.guild) {
        await interaction.reply({ content: 'This command is only available in a server!', flags: MessageFlags.Ephemeral });
        return null;
    }
    const executor = await interaction.guild.members.fetch(interaction.user.id);
    const database = context.getDatabase?.();
    if (!database) throw new Error('Settings commands require a database');
    if (!executor || (!executor.permissions.has(PermissionFlagsBits.Administrator) && !await verifyModeratorLevel(
        database.moderators, { guildId: interaction.guild.id, accountId: interaction.user.id }, 1,
    ))) {
        await interaction.reply({
            content: "You dont have **ADMINISTRATOR** permission enabled, so you can't run this command!",
            flags: MessageFlags.Ephemeral,
        });
        return null;
    }
    return { guild: interaction.guild, database };
}

export async function executeSetting(interaction: CommandInteraction, context: CommandContext): Promise<void> {
    const authorized = await authorizeSettings(interaction, context);
    if (!authorized) return;
    const setting = settingDefinitions.get(interaction.options.getSubcommand());
    if (!setting) throw new Error('Unknown setting');
    const channel = setting.option === 'channel' ? interaction.options.getChannel('channel') : null;
    const role = setting.option === 'role' ? interaction.options.getRole('role') : null;
    const value = setting.option === 'channel' ? channel?.id : setting.option === 'role' ? role?.id : interaction.options.getString('message');
    const sendable = channel && [ChannelType.GuildText, ChannelType.GuildAnnouncement,
        ChannelType.GuildVoice, ChannelType.GuildStageVoice, ChannelType.PublicThread,
        ChannelType.PrivateThread, ChannelType.AnnouncementThread].includes(channel.type);
    if (!value || (setting.option === 'channel' && !sendable)) {
        const content = setting.option === 'channel' ? "Sorry, I can't find a supported channel!"
            : setting.option === 'role' ? "Sorry, I can't find this role!" : "Sorry, I can't find this message!";
        await interaction.reply({ content, flags: MessageFlags.Ephemeral });
        return;
    }
    const mention = channel ? `<#${channel.id}>` : role ? `<@&${role.id}>` : value;
    const { database, guild } = authorized;
    const data = { [setting.field]: value };
    const current = await database.guildLogs.findUnique({ where: { guildId: guild.id } });
    try {
        if (current) await database.guildLogs.update({ where: { guildId: guild.id }, data });
        else await database.guildLogs.create({ data: { guildId: guild.id, ...data } });
    } catch (error) {
        console.error(error);
        await interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [{
            color: 0xff0000, title: setting.failureTitle, description: setting.failureDescription(mention),
            timestamp: new Date().toISOString(), footer: { text: interaction.client.user?.username ?? 'Bob Watts' },
        }] });
        return;
    }
    await interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [{
        color: 0x28a745, title: setting.successTitle, description: setting.successDescription(mention),
        ...(setting.option === 'message' ? { fields: [{
            name: setting.field === 'welcome_message' ? 'Current Welcome message' : 'Current Goodbye message', value,
        }] } : {}),
        timestamp: new Date().toISOString(), footer: { text: interaction.client.user?.username ?? 'Bob Watts' },
    }] });
}

export async function removeSetting(interaction: CommandInteraction, context: CommandContext): Promise<void> {
    const authorized = await authorizeSettings(interaction, context);
    if (!authorized) return;
    const setting = settingDefinitions.get(interaction.options.getSubcommand());
    if (!setting) throw new Error('Unknown setting');
    const { database, guild } = authorized;
    const current = await database.guildLogs.findUnique({ where: { guildId: guild.id } });
    const configured = current?.[setting.field] != null;
    if (configured) {
        try {
            await database.guildLogs.update({ where: { guildId: guild.id }, data: { [setting.field]: null } });
        } catch (error) {
            console.error(error);
            await interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [{
                color: 0xff0000, title: setting.removalFailureTitle, description: setting.removalFailureDescription,
                timestamp: new Date().toISOString(), footer: { text: interaction.client.user?.username ?? 'Bob Watts' },
            }] });
            return;
        }
    }
    await interaction.reply({ flags: MessageFlags.Ephemeral, embeds: [{
        color: configured ? 0x28a745 : 0xff0000,
        title: configured ? setting.removedTitle : setting.missingTitle,
        description: configured ? setting.removedDescription : setting.missingDescription,
        timestamp: new Date().toISOString(), footer: { text: interaction.client.user?.username ?? 'Bob Watts' },
    }] });
}
