'use strict';

const VerificationLevel = require('../../App/Commands/VerificationLevel');
const Action = require('../../App/Commands/Actions');
const { Permissions } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('set')
    .setDescription('This command is to set pre-defined settings')
    .addSubcommand(subcommand =>
        subcommand
            .setName('joinchannel')
            .setDescription('Set a custom join log channel for this server')
            .addChannelOption(option => option.setName('channel').setDescription('Here you can set the channel').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('leavechannel')
            .setDescription('Set a custom leave log channel for this server')
            .addChannelOption(option => option.setName('channel').setDescription('Here you can set the channel').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('editchannel')
            .setDescription('Set a custom edit log channel for this server')
            .addChannelOption(option => option.setName('channel').setDescription('Here you can set the channel').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('deletechannel')
            .setDescription('Set a custom delete log channel for this server')
            .addChannelOption(option => option.setName('channel').setDescription('Here you can set the channel').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('infractionchannel')
            .setDescription('Set a custom infraction log channel for moderation')
            .addChannelOption(option => option.setName('channel').setDescription('Here you can set the channel').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('muterole')
            .setDescription('Set a custom mute role for this server')
            .addRoleOption(option => option.setName('role').setDescription('Here you can set the custom role').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('autorole')
            .setDescription('Set a custom auto role for this server')
            .addRoleOption(option => option.setName('role').setDescription('Here you can set the custom role').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('welcomemessage')
            .setDescription('Set a custom welcome message for new members in this server')
            .addStringOption(option => option.setName('message').setDescription('Here you can set the custom message (Custom emojis WILL NOT WORK)').setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('goodbyemessage')
            .setDescription('Set a custom goodbye message for new members in this server')
            .addStringOption(option => option.setName('message').setDescription('Here you can set the custom message (Custom emojis WILL NOT WORK)').setRequired(true)));

module.exports = {
    data:        data,
    name:        'set',
    description: 'This command is to set pre-defined settings',
    execute:     async (interaction) => {
        // Verify the user if they have enough permissions
        // 1 = Administrator
        // 2 = Moderator
        // 3 = Soft Moderator
        let executor = await interaction.guild.members.fetch(interaction.user.id);
        let setAction = new Action(interaction);

        // If the user have enough permissions, continue
        if (executor.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            switch (interaction.options.getSubcommand()) {
                case 'joinchannel':
                    await setAction.setJoinChannel();
                    break;
                case 'leavechannel':
                    await setAction.setLeaveChannel();
                    break;
                case 'editchannel':
                    await setAction.setEditChannel();
                    break;
                case 'deletechannel':
                    await setAction.setDeleteChannel();
                    break;
                case 'infractionchannel':
                    await setAction.setInfractionChannel();
                    break;
                case 'muterole':
                    await setAction.setMuteRole();
                    break;
                case 'autorole':
                    await setAction.setAutoRole();
                    break;
                case 'welcomemessage':
                    await setAction.setWelcomeMessage();
                    break;
                case 'goodbyemessage':
                    await setAction.setGoodbyeMessage();
                    break;
            }
        } else {
            let verificationLevel = new VerificationLevel(interaction, 1);
            let verified = await verificationLevel.getUser();

            if (verified) {
                switch (interaction.options.getSubcommand()) {
                    case 'joinchannel':
                        await setAction.setJoinChannel();
                        break;
                    case 'leavechannel':
                        await setAction.setLeaveChannel();
                        break;
                    case 'editchannel':
                        await setAction.setEditChannel();
                        break;
                    case 'deletechannel':
                        await setAction.setDeleteChannel();
                        break;
                    case 'infractionchannel':
                        await setAction.setInfractionChannel();
                        break;
                    case 'muterole':
                        await setAction.setMuteRole();
                        break;
                    case 'autorole':
                        await setAction.setAutoRole();
                        break;
                    case 'welcomemessage':
                        await setAction.setWelcomeMessage();
                        break;
                    case 'goodbyemessage':
                        await setAction.setGoodbyeMessage();
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
