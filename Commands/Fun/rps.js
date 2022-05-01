'use strict';

module.exports = {
    name:        'rps',
    description: `Game: Rock, Paper, Scissors`,
    execute:     async (interaction) => {
        const tool = interaction.options.getString('tool')

        let toolArray = [
            'rock',
            'paper',
            'scissors'
        ];

        let answer = Math.floor(Math.random() * toolArray.length);

        let responseMessage;

        // This needs improvements ASAP
        if (toolArray[answer] === tool) {
            responseMessage = `<@${interaction.user.id}>, we have a draw. My hand was **${tool}**`;
        } else if (toolArray[answer] === 'rock' && tool === 'paper') {
            responseMessage = `<@${interaction.user.id}>, you won. My hand was **Rock**`;
        } else if (toolArray[answer] === 'rock' && tool === 'scissors') {
            responseMessage = `<@${interaction.user.id}>, you lost. My hand was **Rock**`;
        } else if (toolArray[answer] === 'scissors' && tool === 'rock') {
            responseMessage = `<@${interaction.user.id}>, you won. My hand was **Scissors**`;
        } else if (toolArray[answer] === 'scissors' && tool === 'paper') {
            responseMessage = `<@${interaction.user.id}>, you lost. My hand was **Scissors**`;
        } else if (toolArray[answer] === 'paper' && tool === 'rock') {
            responseMessage = `<@${interaction.user.id}>, you lost. My hand was **Paper**`;
        } else if (toolArray[answer] === 'paper' && tool === 'scissors') {
            responseMessage = `<@${interaction.user.id}>, you won. My hand was **Paper**`;
        }

        let embed = {
            color:       '#17a2b8',
            description: `${responseMessage}`,
            timestamp:   new Date(),
            footer:      {
                text: interaction.client.user.username
            }
        };

        await interaction.reply({ embeds: [embed] });
    },
};