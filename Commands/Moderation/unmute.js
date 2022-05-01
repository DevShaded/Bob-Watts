'use strict';

const Moderation = require("../../App/Commands/Moderation");
const { Permissions } = require("discord.js");
const VerificationLevel = require("../../App/Commands/VerificationLevel");

module.exports = {
    name: 'unmute',
    description: 'Unmute the mentioned user in your server',
    execute: async (interaction) => {
        // Verify the user if they have enough permissions
        // 1 = Administrator
        // 2 = Moderator
        // 3 = Soft Moderator

        let moderationAction = new Moderation(interaction, 'unmute');

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
    }
};