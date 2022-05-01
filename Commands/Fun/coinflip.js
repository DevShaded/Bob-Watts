'use strict';

const { SlashCommandBuilder } = require("@discordjs/builders");

const data = new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flips a coin and return either Heads or Tails')

module.exports = {
    data:        data,
    name:        'coinflip',
    description: 'Flips a coin and return either Heads or Tails',
    execute:     async (interaction) => {
        let coinArray = [
            'Heads',
            'Tails'
        ];

        // Pick a random coin
        let coin = coinArray[Math.floor(Math.random() * coinArray.length)];

        const embed = {
            color:       '#17a2b8',
            description: `<:coin:620255307284742154> I flipped a coin and it landed on **${coin}**`,
        };

        await interaction.reply({ embeds: [embed] });
    },
};
