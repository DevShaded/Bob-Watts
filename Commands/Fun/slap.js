'use strict';

const { SlashCommandBuilder } = require('@discordjs/builders');

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
            color:       '#17a2b8',
            description: `👏 <@${interaction.user.id}> slapped <@${mentioned.id}> hardly`,
            timestamp:   new Date(),
            footer:      {
                text:     interaction.client.user.username,
                icon_url: ''
            }
        };

        await interaction.reply({ embeds: [embed] });
    },
};
