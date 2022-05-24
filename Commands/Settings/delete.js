'use strict';

const VerificationLevel = require('../../App/Commands/VerificationLevel');
const Moderator = require('../../App/Commands/Moderator');
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('delete')
    .setDescription('This command is to set pre-defined settings')
    .addSubcommand(subcommand =>
        subcommand
            .setName('softmoderator')
            .setDescription('Delete a soft moderator from the servers moderation list')
            .addUserOption(option => option.setName('target').setDescription('Choose the user you want to delete').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('moderator')
            .setDescription('Delete a moderator from the servers moderation list')
            .addUserOption(option => option.setName('target').setDescription('Choose the user you want to delete').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('administrator')
            .setDescription('Delete a administrator from the servers moderation list')
            .addUserOption(option => option.setName('target').setDescription('Choose the user you want to delete').setRequired(true)));

module.exports = {
    data:        data,
    name:        'delete',
    description: 'This command is to set pre-defined settings',
    execute:     async (interaction) => {
        // Verify the user if they have enough permissions
        // 1 = Administrator
        // 2 = Moderator
        // 3 = Soft Moderator
        let executor = await interaction.guild.members.fetch(interaction.user.id);
        let removeModerator = new Moderator(interaction);

        // If the user have enough permissions, continue
        if (executor.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            switch (interaction.options.getSubcommand()) {
                case 'softmoderator':
                    await removeModerator.deleteSoftModerator();
                    break;
                case 'moderator':
                    await removeModerator.deleteModerator();
                    break;
                case 'administrator':
                    await removeModerator.deleteAdministrator();
                    break;
            }
        } else {
            let verificationLevel = new VerificationLevel(interaction, 1);
            let verified = await verificationLevel.getUser();

            if (verified) {
                switch (interaction.options.getSubcommand()) {
                    case 'softmoderator':
                        await removeModerator.deleteSoftModerator();
                        break;
                    case 'moderator':
                        await removeModerator.deleteModerator();
                        break;
                    case 'administrator':
                        await removeModerator.deleteAdministrator();
                        break;
                }
            } else {
                // If the user does have not enough permissions, return message with no permissions
                return interaction.reply({
                    content:   'You dont have **ADMINISTRATOR** permission enabled, so you can\'t run this command!',
                    ephemeral: true
                });
            }
        }
    },
};
