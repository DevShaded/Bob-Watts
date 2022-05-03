'use strict';

const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Moderation = require("../../App/Commands/Moderation");
const VerificationLevel = require('../../App/Commands/VerificationLevel')

const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from your server')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('Choose the user you want to ban from your server')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('days')
            .setDescription('Delete message history')
            .addChoices({
                    "name":  '0 Days',
                    "value": 1
                },
                {
                    "name":  '1 Days',
                    "value": 1
                },
                {
					"name":  '2 Days',
                    "value": 2
                },
                {
                    "name":  '3 Days',
                    "value": 3
                },
                {
                    "name":  '4 Days',
                    "value": 4
                },
                {
                    "name":  '5 Days',
                    "value": 5
                },
                {
                    "name":  '6 Days',
                    "value": 6
                },
                {
                    "name":  '7 Days',
                    "value": 7
                })
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('Specify a reason why you want to ban this user'));

module.exports = {
    data: data,
    name: 'ban',
    description: 'Ban the mentioned user from a server',
    execute: async (interaction) => {
        // Verify the user if they have enough permissions
        // 1 = Administrator
        // 2 = Moderator
        // 3 = Soft Moderator

        let moderationAction = new Moderation(interaction, 'ban');

        let executor = await interaction.guild.members.fetch(interaction.user.id);

        // If the user have enough permissions, continue
        if (executor.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            await moderationAction.getAction();
        } else {
            let verificationLevel = new VerificationLevel(interaction, 2);
            let verified = await verificationLevel.getUser();

            if (verified) {
                await moderationAction.getAction();
            } else {
                // If the user does have not enough permissions, return message with no permissions
                return interaction.reply({
                    content:   'You do not have permission to **BAN_MEMBERS**, so you can\'t run this command!',
                    ephemeral: true
                });
            }
        }
    },
};
