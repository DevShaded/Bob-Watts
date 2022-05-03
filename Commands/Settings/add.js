'use strict';

const VerificationLevel = require('../../App/Commands/VerificationLevel');
const Moderator = require('../../App/Commands/Moderator');
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('add')
    .setDescription('This command is to set pre-defined settings')
    .addSubcommand(subcommand =>
        subcommand
            .setName('softmoderator')
            .setDescription('Add a soft moderator to the servers moderation list')
            .addUserOption(option => option.setName('target').setDescription('Choose the user you want to make soft moderator').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('moderator')
            .setDescription('Add a moderator to the servers moderation list')
            .addUserOption(option => option.setName('target').setDescription('Choose the user you want to make moderator').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('administrator')
            .setDescription('Add a administrator to the servers moderation list')
            .addUserOption(option => option.setName('target').setDescription('Choose the user you want to make administrator').setRequired(true)));

module.exports = {
    data:        data,
    name:        'add',
    description: 'This command is to set pre-defined settings',
    execute:     async (interaction) => {
        // Verify the user if they have enough permissions
        // 1 = Administrator
        // 2 = Moderator
        // 3 = Soft Moderator
        let executor = await interaction.guild.members.fetch(interaction.user.id);
        let addModerator = new Moderator(interaction);

        // If the user have enough permissions, continue
        if (executor.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            switch (interaction.options.getSubcommand()) {
                case 'softmoderator':
                    await addModerator.addSoftModerator();
                    break;
                case 'moderator':
                    await addModerator.addModerator();
                    break;
                case 'administrator':
                    await addModerator.addAdministrator();
                    break;
            }
        } else {
            let verificationLevel = new VerificationLevel(interaction, 1);
            let verified = await verificationLevel.getUser();

            if (verified) {
                switch (interaction.options.getSubcommand()) {
                    case 'softmoderator':
                        await addModerator.addSoftModerator();
                        break;
                    case 'moderator':
                        await addModerator.addModerator();
                        break;
                    case 'administrator':
                        await addModerator.addAdministrator();
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
