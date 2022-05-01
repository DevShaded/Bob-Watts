'use strict';

module.exports = {
    name: 'kiss',
    description: `Kiss the mentioned user`,
    execute: async (interaction) => {
        const mentioned = interaction.options.getUser('user');

        if (!mentioned) {
            return interaction({ contents: 'Could not find that user!', ephemeral: true});
        }

        const kisses = [
            '***fast***',
            '*cutely*',
            '**on the check**'
        ];

        const answer = kisses[Math.floor(Math.random() * kisses.length)];

        const embed = {
            color: '#17a2b8',
            description: `💋 <@${interaction.user.id}> kissed <@${mentioned.id}> ${answer}`,
            timestamp: new Date(),
            footer: {
                text: interaction.client.user.username,
                icon_url: ''
            }
        };

        await interaction.reply({ embeds: [embed] });
    },
};