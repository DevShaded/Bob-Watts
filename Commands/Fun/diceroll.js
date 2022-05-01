'use strict';

const { SlashCommandBuilder } = require("@discordjs/builders");

const data = new SlashCommandBuilder()
    .setName('diceroll')
    .setDescription('Dice roll, returns a number between 1 and 6')

module.exports = {
    data:        data,
    name:        'diceroll',
    description: `Dice roll, returns a number between 1 and 6`,
    execute:     async (interaction) => {
        let diceArray = [
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
        ];

        let answer = diceArray[Math.floor(Math.random() * diceArray.length)];

        const embed = {
            color:       '#17a2b8',
            description: `🎲 I threw a dice and it turned out to be **${answer}**`,
        };

        await interaction.reply({ embeds: [embed] });
    },
};
