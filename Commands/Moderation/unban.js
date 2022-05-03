'use strict';

const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const Moderation = require("../../App/Commands/Moderation");
const VerificationLevel = require('../../App/Commands/VerificationLevel');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const data = new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user that has been banned from your server')
    .addStringOption(option =>
        option.setName('target')
            .setDescription('Enter the UserID from the user that was banned')
            .setRequired(true));

module.exports = {
    data:        data,
    name:        'unban',
    description: 'Unban the mentioned user from a server',
    execute:     async (interaction) => {
        // Verify the user if they have enough permissions
        // 1 = Administrator
        // 2 = Moderator
        // 3 = Soft Moderator

        const userId = interaction.options.getString('target');

        const violator = await prisma.users.findUnique({
            where: {
                accountId: userId
            }
        });

        if (!violator) {
            return interaction.reply({ content: 'This user could not be found!', ephemeral: true });
        }

        let moderationAction = new Moderation(interaction, 'unban');

        let executor = await interaction.guild.members.fetch(interaction.user.id);

        // If the user have enough permissions, continue
        if (executor.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
            await moderationAction.unban(violator);
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
