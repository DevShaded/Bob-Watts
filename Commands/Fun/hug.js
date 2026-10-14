'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('hug')
    .setDescription('Hug the mentioned user')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('Mention the user who you want to give a hug to')
            .setRequired(true));

module.exports = {
    data:        data,
    name:        'hug',
    description: `Hug the mentioned user`,
    execute:     async (interaction) => {
        const mentioned = interaction.options.getUser('user');

        if (!mentioned) {
            return interaction.reply({ content: 'Could not find that user!', flags: MessageFlags.Ephemeral });
        }

        const embed = {
            color:       0x17a2b8,
            description: `🤗 <@${interaction.user.id}> gave <@${mentioned.id}> a hug`,
            timestamp:   new Date().toISOString(),
            footer:      {
                text: interaction.client.user.username
            }
        };

        await interaction.reply({ embeds: [embed] });
    },
};
