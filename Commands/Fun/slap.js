'use strict';

const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('slap')
    .setDescription('Hug the mentioned user')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('Mention the user who you want to slap')
            .setRequired(true));

module.exports = {
    data:        data,
    name:        'slap',
    description: `Slap the mentioned user`,
    execute:     async (interaction) => {
        const mentioned = interaction.options.getUser('user');

        const embed = {
            color:       0x17a2b8,
            description: `👏 <@${interaction.user.id}> slapped <@${mentioned.id}> hardly`,
            timestamp:   new Date().toISOString(),
            footer:      {
                text:     interaction.client.user.username
            }
        };

        await interaction.reply({ embeds: [embed] });
    },
};
