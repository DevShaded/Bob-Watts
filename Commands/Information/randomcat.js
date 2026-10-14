'use strict';

const axios = require('axios');
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('randomcat')
    .setDescription('Get a picture of a random cat!')

module.exports = {
    data:        data,
    name:        'randomcat',
    description: 'Get a picture of a random cat!',
    execute:     async (interaction) => {
        const config = {
            method:  'get',
            url:     `https://api.thecatapi.com/v1/images/search`,
            headers: {}
        };

        await axios(config)
            .then(async (response) => {
                const imageUrl = response.data[0].url;

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setURL(`${imageUrl}`)
                            .setLabel('🖼️ Open Original Image'),
                    );

                const embed = {
                    color:     0x17a2b8,
                    title:     'Here is a picture of a random cat!',
                    image:     {
                        url: `${imageUrl}`,
                    },
                    timestamp: new Date().toISOString(),
                    footer:    {
                        text: interaction.client.user.username,
                    },
                };

                await interaction.reply({ embeds: [embed], components: [row] });
            })
            .catch(async (error) => {
                console.error(error.response.data);
                const embed = {
                    color:       0xff0000,
                    title:       'Something wrong is going on!',
                    description: `Error code: \`${error.response.status} ${error.response.statusText}\` `,
                    timestamp:   new Date().toISOString(),
                    footer:      {
                        text: interaction.client.user.username,
                    },
                };

                await interaction.reply({ embeds: [embed] });
            });
    },
};
