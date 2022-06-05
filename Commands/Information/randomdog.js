'use strict';

const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName('randomdog')
    .setDescription('Get a picture of a random dog!')

module.exports = {
    data:        data,
    name:        'randomdog',
    description: 'Get a picture of a random dog',
    execute:     async (interaction) => {
        let config = {
            method:  'get',
            url:     `https://dog.ceo/api/breeds/image/random`,
            headers: {}
        };

        await axios(config)
            .then(async (response) => {
                const picture = response.data.message;

                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setStyle('LINK')
                            .setURL(`${picture}`)
                            .setLabel('🖼️ Open Original Image'),
                    );

                const embed = {
                    color: '#17a2b8',
                    title: 'Here is a picture of a random dog!',
                    image: {
                        url: `${picture}`,
                    },
                    timestamp: new Date(),
                    footer:      {
                        text: interaction.client.user.username,
                    },
                };

                await interaction.reply({ embeds: [embed], components: [row] });
            })
            .catch(async (error) => {
                console.error(error.response.data);
                const embed = {
                    color: '#17a2b8',
                    title: 'Something wrong is going on!',
                    description: `Error code: \`${error.response.status} ${error.response.statusText}\` `,
                    timestamp: new Date(),
                    footer:      {
                        text: interaction.client.user.username,
                    },
                };

                await interaction.reply({ embeds: [embed] });
            });
    },
};
