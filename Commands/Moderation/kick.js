'use strict';

const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Moderation = require("../../App/Commands/Moderation");
const VerificationLevel = require('../../App/Commands/VerificationLevel')

const data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick the mentioned user from the server')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('Choose the user you want to kick from your server')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('Specify a reason why you want to kick this user'));

module.exports = {
    data:        data,
    name:        'kick',
    description: 'Kick the mentioned user from a server',
    execute:     async (interaction) => {
        // Verify the user if they have enough permissions
        // 1 = Administrator
        // 2 = Moderator
        // 3 = Soft Moderator

        let moderationAction = new Moderation(interaction, 'kick');

        let executor = await interaction.guild.members.fetch(interaction.user.id);

        // If the user have enough permissions, continue
        if (executor.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
            await moderationAction.getAction();
        } else {
            let verificationLevel = new VerificationLevel(interaction, 2);
            let verified = await verificationLevel.getUser();

            if (verified) {
                await moderationAction.getAction();
            } else {
                // If the user does have not enough permissions, return message with no permissions
                return interaction.reply({
                    content:   'You do not have permission to **KICK_MEMBERS**, so you can\'t run this command!',
                    ephemeral: true
                });
            }
        }
    },
};
