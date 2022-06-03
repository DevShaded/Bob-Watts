'use strict';

const VerificationLevel = require('../../App/Commands/VerificationLevel');
const Action = require('../../App/Commands/Actions');
const { Permissions } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('This command is to set pre-defined settings')
    .addSubcommand(subcommand =>
        subcommand
            .setName('joinchannel')
            .setDescription('Remove the custom join log channel for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('leavechannel')
            .setDescription('Remove the custom leave log channel for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('editchannel')
            .setDescription('Remove the custom edit log channel for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('deletechannel')
            .setDescription('Remove the custom delete log channel for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('infractionchannel')
            .setDescription('Remove the custom infraction log channel for moderation'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('muterole')
            .setDescription('Remove the custom mute role for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('autorole')
            .setDescription('Remove the custom auto role for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('welcomemessage')
            .setDescription('Remove the custom welcome message for this server'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('goodbyemessage')
            .setDescription('Remove the custom goodbye message for this server'));

module.exports = {
    data:        data,
    name:        'remove',
    description: 'This command is to set pre-defined settings',
    execute:     async (interaction) => {
        // Verify the user if they have enough permissions
        // 1 = Administrator
        // 2 = Moderator
        // 3 = Soft Moderator
        let executor = await interaction.guild.members.fetch(interaction.user.id);
        let removeAction = new Action(interaction);

        // If the user have enough permissions, continue
        if (executor.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            switch (interaction.options.getSubcommand()) {
                case 'joinchannel':
                    await removeAction.removeJoinChannel();
                    break;
                case 'leavechannel':
                    await removeAction.removeLeaveChannel();
                    break;
                case 'editchannel':
                    await removeAction.removeEditChannel();
                    break;
                case 'deletechannel':
                    await removeAction.removeDeleteChannel();
                    break;
                case 'infractionchannel':
                    await removeAction.removeInfractionChannel();
                    break;
                case 'muterole':
                    await removeAction.removeMuteRole();
                    break;
                case 'autorole':
                    await removeAction.removeAutoRole();
                    break;
                case 'welcomemessage':
                    await removeAction.removeWelcomeMessage();
                    break;
                case 'goodbyemessage':
                    await removeAction.removeGoodbyeMessage();
                    break;
            }
        } else {
            let verificationLevel = new VerificationLevel(interaction, 1);
            let verified = await verificationLevel.getUser();

            if (verified) {
                switch (interaction.options.getSubcommand()) {
                    case 'joinchannel':
                        await removeAction.removeJoinChannel();
                        break;
                    case 'leavechannel':
                        await removeAction.removeLeaveChannel();
                        break;
                    case 'editchannel':
                        await removeAction.removeEditChannel();
                        break;
                    case 'deletechannel':
                        await removeAction.removeDeleteChannel();
                        break;
                    case 'infractionchannel':
                        await removeAction.removeInfractionChannel();
                        break;
                    case 'muterole':
                        await removeAction.removeMuteRole();
                        break;
                    case 'autorole':
                        await removeAction.removeAutoRole();
                        break;
                    case 'welcomemessage':
                        await removeAction.removeWelcomeMessage();
                        break;
                    case 'goodbyemessage':
                        await removeAction.removeGoodbyeMessage();
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
