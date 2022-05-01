'use strict';

module.exports = {
    name:        'hug',
    description: `Hug the mentioned user`,
    execute:     async (interaction) => {
        const mentioned = interaction.options.getUser('user');

        if (!mentioned) {
            return interaction({ contents: 'Could not find that user!', ephemeral: true});
        }

        const embed = {
            color:       '#17a2b8',
            description: `🤗 <@${interaction.user.id}> gave <@${mentioned.id}> a hug`,
            timestamp:   new Date(),
            footer:      {
                text: interaction.client.user.username
            }
        };

        await interaction.reply({ embeds: [embed] });
    },
};