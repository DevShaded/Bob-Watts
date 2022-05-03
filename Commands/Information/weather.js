'use strict';

require('dotenv').config();
const axios = require('axios');

const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get the current weather forecast for a location')
    .addStringOption(option =>
        option.setName('location')
            .setDescription('Choose the location where you want weather forecast from!')
            .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('units')
            .setDescription('Your tools use one of the following: rock, paper, scissors')
            .addChoices({
                    "name":  'Metric (Celsius)',
                    "value": "metric"
                },
                {
                    "name":  "Imperial (Fahrenheit)",
                    "value": "imperial"
                },
                {
                    "name":  "Kelvin",
                    "value": "kelvin"
                })
            .setRequired(true)
    );

module.exports = {
    data:        data,
    name:        'weather',
    description: 'Get the current weather forecast for a location',
    execute:     async (interaction) => {
        const location = encodeURI(interaction.options.getString('location'));
        const unit = interaction.options.getString('units')

        let symbolLetter;
        let speedUnitSystem;
        switch (unit) {
            case 'metric':
                symbolLetter = '°C';
                speedUnitSystem = 'm/s';
                break;
            case 'imperial':
                symbolLetter = '°F';
                speedUnitSystem = 'mph';
                break;
            case 'kelvin':
                symbolLetter = 'K';
                speedUnitSystem = 'K/m';
                break;
        }

        const config = {
            method:  'get',
            url:     `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.APP_WEATHER_API}&units=${unit}`,
            headers: {}
        };

        await axios(config)
            .then(async (response) => {
                const getWeatherIcon = `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`;

                let weatherDescription = response.data.weather[0].description;
                weatherDescription = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);

                const weatherEmbed = {
                    color:       '#17a2b8',
                    title:       `${response.data.name}, ${response.data.sys['country']}`,
                    description: `Here is the weather forecast for ${response.data.name}. [Full Forecast](https://openweathermap.org/city/${response.data.id})`,
                    thumbnail:   {
                        url: `${getWeatherIcon}`,
                    },
                    fields:      [
                        {
                            name:   '🔦 Current Weather',
                            value:  `Feels like ${response.data.main.feels_like.toFixed() + symbolLetter}.\n **${weatherDescription}**`,
                            inline: true
                        },
                        {
                            name:   '🌡️ Temperature',
                            value:  `${response.data.main.temp.toFixed() + symbolLetter}`,
                            inline: true
                        },
                        {
                            name:   '☁️ Cloud coverage',
                            value:  `${response.data.clouds.all}%`,
                            inline: true
                        },
                        {
                            name:   '🌬️ Wind speed',
                            value:  `${response.data.wind.speed + speedUnitSystem}`,
                            inline: true
                        },
                        {
                            name:   '🌅️ Sunrise',
                            value:  `<t:${response.data.sys.sunrise}:t>`,
                            inline: true
                        },
                        {
                            name:   '🌇 Sunset',
                            value:  `<t:${response.data.sys.sunset}:t>`,
                            inline: true
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: interaction.client.user.username
                    }
                };

                await interaction.reply({ embeds: [weatherEmbed] });

            })
            .catch(async (error) => {
                console.log(error)
                const errorEmbed = {
                    color:       '#ff0000',
                    description: `Looks like something is wrong!`,
                    footer:      {
                        text: `Error message: ${error.response.data.cod} ${error.response.data.message}`
                    }
                }

                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            });

    },
};
