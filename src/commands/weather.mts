import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { httpTransport } from '../http.mjs';
import { botUser } from './bot-user.mjs';
import { record } from './information-response.mjs';

function finite(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function text(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0 && value.length <= 200;
}

function forecast(body: unknown) {
    if (!record(body) || !Array.isArray(body.weather)) throw new Error('Invalid weather response');
    const weather: unknown = body.weather[0];
    const { main, sys, wind, clouds } = body;
    if (!text(body.name) || !finite(body.id) || !Number.isSafeInteger(body.id) || body.id <= 0
        || !record(weather) || !text(weather.description) || !text(weather.icon) || !/^\d{2}[dn]$/.test(weather.icon)
        || !record(main) || !finite(main.feels_like) || !finite(main.temp)
        || !record(sys) || !text(sys.country) || !finite(sys.sunrise) || !Number.isSafeInteger(sys.sunrise)
        || !finite(sys.sunset) || !Number.isSafeInteger(sys.sunset)
        || !record(wind) || !finite(wind.speed) || !record(clouds) || !finite(clouds.all)) {
        throw new Error('Invalid weather response');
    }
    return {
        name: body.name, id: body.id, description: weather.description, icon: weather.icon,
        feelsLike: main.feels_like, temperature: main.temp, country: sys.country,
        sunrise: sys.sunrise, sunset: sys.sunset, speed: wind.speed, clouds: clouds.all,
    };
}

export const weather: Command = {
    category: 'Information',
    data: new SlashCommandBuilder()
        .setName('weather').setDescription('Get the current weather forecast for a location')
        .addStringOption(option => option.setName('location')
            .setDescription('Choose the location where you want weather forecast from!').setRequired(true))
        .addStringOption(option => option.setName('units')
            .setDescription('Your tools use one of the following: rock, paper, scissors')
            .addChoices(
                { name: 'Metric (Celsius)', value: 'metric' },
                { name: 'Imperial (Fahrenheit)', value: 'imperial' },
                { name: 'Kelvin', value: 'kelvin' },
            ).setRequired(true)),
    async execute(interaction, context) {
        if (!context.weatherApi?.trim()) {
            await interaction.reply({
                content: 'Weather is unavailable because it has not been configured.', flags: MessageFlags.Ephemeral,
            });
            return;
        }
        const location = interaction.options.getString('location');
        const units = interaction.options.getString('units');
        if (!location || (units !== 'metric' && units !== 'imperial' && units !== 'kelvin')) {
            throw new Error('Missing weather options');
        }
        const query = new URLSearchParams({ q: location, appid: context.weatherApi, units });
        let result: ReturnType<typeof forecast>;
        try {
            result = forecast(await (context.http ?? httpTransport).get(
                `https://api.openweathermap.org/data/2.5/weather?${query.toString()}`,
            ));
        } catch (error) {
            let message = 'Weather service is unavailable. Please try again later.';
            if (record(error) && record(error.response) && record(error.response.data)) {
                const { cod, message: detail } = error.response.data;
                if ((text(cod) || (finite(cod) && Number.isInteger(cod))) && text(detail)) {
                    message = `${cod.toString()} ${detail}`;
                }
            }
            await interaction.reply({ embeds: [{
                color: 0xff0000, description: 'Looks like something is wrong!',
                footer: { text: `Error message: ${message}` },
            }], flags: MessageFlags.Ephemeral });
            return;
        }
        const symbol = units === 'metric' ? '°C' : units === 'imperial' ? '°F' : 'K';
        const speed = units === 'imperial' ? 'mph' : 'm/s';
        const description = result.description.charAt(0).toUpperCase() + result.description.slice(1);
        await interaction.reply({ embeds: [{
            color: 0x17a2b8, title: `${result.name}, ${result.country}`,
            description: `Here is the weather forecast for ${result.name}. [Full Forecast](https://openweathermap.org/city/${result.id.toString()})`,
            thumbnail: { url: `https://openweathermap.org/img/wn/${result.icon}@2x.png` },
            fields: [
                { name: '🔦 Current Weather', value: `Feels like ${result.feelsLike.toFixed()}${symbol}.\n **${description}**`, inline: true },
                { name: '🌡️ Temperature', value: `${result.temperature.toFixed()}${symbol}`, inline: true },
                { name: '☁️ Cloud coverage', value: `${result.clouds.toString()}%`, inline: true },
                { name: '🌬️ Wind speed', value: `${result.speed.toString()}${speed}`, inline: true },
                { name: '🌅️ Sunrise', value: `<t:${result.sunrise.toString()}:t>`, inline: true },
                { name: '🌇 Sunset', value: `<t:${result.sunset.toString()}:t>`, inline: true },
            ],
            timestamp: new Date().toISOString(), footer: { text: botUser(interaction).username },
        }] });
    },
};
