'use strict';

const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Moderation = require("../../App/Commands/Moderation");
const VerificationLevel = require('../../App/Commands/VerificationLevel');

const data = new SlashCommandBuilder()
    .setName('clean')
    .setDescription('Remove a certain amount of message from a user in the server')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('Choose the user you want to clean messages from your server')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('amount')
            .setDescription('Choose how many messages you want delete from that user')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('Specify a reason why you want to remove messages from this user'));

module.exports = {
    data:        data,
    name:        'clean',
    description: `Remove a certain amount of message from a user in the server`,
    execute:     async (interaction) => {
        // Verify the user if they have enough permissions
        // 1 = Administrator
        // 2 = Moderator
        // 3 = Soft Moderator

        let moderationAction = new Moderation(interaction, 'clean');

        let executor = await interaction.guild.members.fetch(interaction.user.id);

        // If the user have enough permissions, continue
        if (executor.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            await moderationAction.getAction();
        } else {
            let verificationLevel = new VerificationLevel(interaction, 2);
            let verified = await verificationLevel.getUser();

            if (verified) {
                await moderationAction.getAction();
            } else {
                // If the user does have not enough permissions, return message with no permissions
                return interaction.reply({
                    content:   'You do not have permission to **MANAGE_MESSAGES**, so you can\'t run this command!',
                    ephemeral: true
                });
            }
        }
    },
};
