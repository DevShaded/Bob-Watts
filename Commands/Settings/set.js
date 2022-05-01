'use strict';

const VerificationLevel = require('../../App/Commands/VerificationLevel');
const Action = require('../../App/Commands/Actions');
const { Permissions } = require("discord.js");

module.exports = {
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