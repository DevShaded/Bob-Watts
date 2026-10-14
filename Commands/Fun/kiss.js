'use strict';

const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('kiss')
    .setDescription('Kiss the mentioned user')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('Mention the user who you want to give a kiss to')
            .setRequired(true));

module.exports = {
    data:        data,
    name:        'kiss',
    description: `Kiss the mentioned user`,
    execute:     async (interaction) => {
        const mentioned = interaction.options.getUser('user');

        if (!mentioned) {
            return interaction.reply({ content: 'Could not find that user!', flags: MessageFlags.Ephemeral });
        }

        const kisses = [
            '***fast***',
            '*cutely*',
            '**on the check**'
        ];

        const answer = kisses[Math.floor(Math.random() * kisses.length)];

        const embed = {
            color:       0x17a2b8,
            description: `💋 <@${interaction.user.id}> kissed <@${mentioned.id}> ${answer}`,
            timestamp:   new Date().toISOString(),
            footer:      {
                text:     interaction.client.user.username
            }
        };

        await interaction.reply({ embeds: [embed] });
    },
};
