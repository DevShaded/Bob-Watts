'use strict';

const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Moderation = require("../../App/Commands/Moderation");
const VerificationLevel = require('../../App/Commands/VerificationLevel')

const data = new SlashCommandBuilder()
    .setName('infractions')
    .setDescription('Get all infractions of the mentioned user in a server')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('Choose the user you want to get infractions from')
            .setRequired(true));

module.exports = {
    data:        data,
    name:        'infractions',
    description: 'Get all infractions of the mentioned user in a server',
    execute:     async (interaction) => {
        // Verify the user if they have enough permissions
        // 1 = Administrator
        // 2 = Moderator
        // 3 = Soft Moderator

        let moderationAction = new Moderation(interaction, 'infractions');

        let executor = await interaction.guild.members.fetch(interaction.user.id);

        // If the user have enough permissions, continue
        if (executor.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            await moderationAction.getAction();
        } else {
            let verificationLevel = new VerificationLevel(interaction, 3);
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
