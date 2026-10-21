import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import type { APIEmbed } from 'discord.js';
import { startBot } from '../../src/application.mjs';
import type { HttpTransport } from '../../src/contracts.mjs';
import { OfflineGateway, OfflineInteraction, startupEnvironment } from './discord.mjs';

async function dispatch(commandName: string, http: HttpTransport, weatherApi?: string, units = 'metric', location = 'New York') {
    const gateway = new OfflineGateway();
    const errors: unknown[] = [];
    await startBot({
        env: { ...startupEnvironment, APP_WEATHER_API: weatherApi },
        createGateway: () => gateway, http,
        reportError: error => { errors.push(error); },
    });
    const interaction = new OfflineInteraction();
    interaction.commandName = commandName;
    interaction.strings.set('location', location);
    interaction.strings.set('units', units);
    await gateway.dispatch(interaction);
    assert.deepEqual(errors, []);
    return interaction;
}

function embed(interaction: OfflineInteraction): APIEmbed {
    assert.equal(interaction.responses.length, 1);
    const result = interaction.responses[0]?.payload.embeds?.[0];
    assert.ok(result && !('toJSON' in result));
    assert.deepEqual(new EmbedBuilder(result).toJSON(), result);
    return result;
}

await test('cat dispatch returns the original image and a Discord link button', async () => {
    const interaction = await dispatch('randomcat', { get: url => {
        assert.equal(url, 'https://api.thecatapi.com/v1/images/search');
        return Promise.resolve([{ url: 'https://example.com/cat.jpg' }]);
    } });
    assert.partialDeepStrictEqual(embed(interaction), {
        color: 0x17a2b8, title: 'Here is a picture of a random cat!',
        image: { url: 'https://example.com/cat.jpg' }, footer: { text: 'Test bot' },
    });
    const payload: unknown = JSON.parse(JSON.stringify(interaction.responses[0]?.payload));
    assert.partialDeepStrictEqual(payload, { components: [{ type: 1, components: [{
        type: 2, style: 5, url: 'https://example.com/cat.jpg', label: '🖼️ Open Original Image',
    }] }] });
});

await test('dog dispatch preserves its image embed and original image link', async () => {
    const interaction = await dispatch('randomdog', { get: url => {
        assert.equal(url, 'https://dog.ceo/api/breeds/image/random');
        return Promise.resolve({ message: 'https://example.com/dog.jpg', status: 'success' });
    } });
    assert.partialDeepStrictEqual(embed(interaction), {
        color: 0x17a2b8, title: 'Here is a picture of a random dog!',
        image: { url: 'https://example.com/dog.jpg' }, footer: { text: 'Test bot' },
    });
    const payload: unknown = JSON.parse(JSON.stringify(interaction.responses[0]?.payload));
    assert.partialDeepStrictEqual(payload, { components: [{ type: 1, components: [{
        type: 2, style: 5, url: 'https://example.com/dog.jpg', label: '🖼️ Open Original Image',
    }] }] });
});

await test('image commands reject malformed bodies and handle network failures without secondary errors', async () => {
    for (const command of ['randomcat', 'randomdog']) {
        for (const body of [null, {}, [], [null], [{ url: 12 }], { message: 12 },
            [{ url: 'javascript:alert(1)' }], { message: 'not a URL' },
            [{ url: '' }], { message: '' }, [{ url: 'https://example.com/' + 'x'.repeat(600) }],
            { message: 'https://example.com/' + 'x'.repeat(600) }]) {
            const interaction = await dispatch(command, { get: () => Promise.resolve(body) });
            assert.equal(embed(interaction).title, 'Something wrong is going on!');
            assert.equal(interaction.responses[0]?.payload.components, undefined);
        }
        for (const failure of [new Error('offline'), Object.assign(new Error('offline'), { response: null })]) {
            const interaction = await dispatch(command, { get: () => Promise.reject(failure instanceof Error ? failure : Object.assign(new Error('HTTP failure'), failure)) });
            assert.equal(embed(interaction).description, 'The image service is unavailable. Please try again later.');
        }
    }
});

const forecast = {
    name: 'New York', id: 5128581, sys: { country: 'US', sunrise: 1700000000, sunset: 1700040000 },
    weather: [{ icon: '01d', description: 'clear sky' }],
    main: { feels_like: 19.7, temp: 20.3 }, clouds: { all: 5 }, wind: { speed: 3.2 },
};

await test('weather dispatch preserves a valid forecast and supplies optional credentials to HTTP', async () => {
    const interaction = await dispatch('weather', { get: url => {
        assert.equal(url, 'https://api.openweathermap.org/data/2.5/weather?q=New+York&appid=weather-key&units=metric');
        return Promise.resolve(forecast);
    } }, 'weather-key');
    assert.partialDeepStrictEqual(embed(interaction), {
        color: 0x17a2b8, title: 'New York, US',
        description: 'Here is the weather forecast for New York. [Full Forecast](https://openweathermap.org/city/5128581)',
        thumbnail: { url: 'https://openweathermap.org/img/wn/01d@2x.png' },
        fields: [
            { name: '🔦 Current Weather', value: 'Feels like 20°C.\n **Clear sky**', inline: true },
            { name: '🌡️ Temperature', value: '20°C', inline: true },
            { name: '☁️ Cloud coverage', value: '5%', inline: true },
            { name: '🌬️ Wind speed', value: '3.2m/s', inline: true },
            { name: '🌅️ Sunrise', value: '<t:1700000000:t>', inline: true },
            { name: '🌇 Sunset', value: '<t:1700040000:t>', inline: true },
        ], footer: { text: 'Test bot' },
    });
});


await test('weather remains optional at startup and unavailable invocation makes no HTTP request', async () => {
    for (const key of [undefined, '', '   ']) {
        const interaction = await dispatch('weather', {
            get: () => { throw new Error('Unconfigured weather must not request HTTP'); },
        }, key);
        assert.deepEqual(interaction.responses, [{ method: 'reply', payload: {
            content: 'Weather is unavailable because it has not been configured.', flags: MessageFlags.Ephemeral,
        } }]);
    }
});

await test('weather safely rejects every missing consumed field and malformed numeric or nested values', async () => {
    const malformed: unknown[] = [
        null, {}, { ...forecast, weather: [] }, { ...forecast, weather: [null] },
        { ...forecast, name: '' }, { ...forecast, id: '5128581' },
        { ...forecast, weather: [{ icon: '../bad', description: 'clear' }] },
        { ...forecast, main: { feels_like: '20', temp: 20 } },
        { ...forecast, main: { feels_like: 20, temp: NaN } },
        { ...forecast, wind: { speed: Infinity } }, { ...forecast, clouds: { all: '5' } },
        { ...forecast, sys: { country: 'US', sunrise: 1.5, sunset: 1700040000 } },
    ];
    for (const key of Object.keys(forecast)) {
        const body = Object.fromEntries(Object.entries(forecast).filter(([name]) => name !== key));
        malformed.push(body);
    }
    for (const [parent, fields] of Object.entries({
        main: forecast.main, sys: forecast.sys, wind: forecast.wind, clouds: forecast.clouds,
    })) {
        for (const key of Object.keys(fields)) {
            const nested = Object.fromEntries(Object.entries(fields).filter(([name]) => name !== key));
            malformed.push({ ...forecast, [parent]: nested });
        }
    }
    for (const key of ['icon', 'description']) {
        const item = Object.fromEntries(Object.entries(forecast.weather[0] ?? {}).filter(([name]) => name !== key));
        malformed.push({ ...forecast, weather: [item] });
    }
    for (const body of malformed) {
        const interaction = await dispatch('weather', { get: () => Promise.resolve(body) }, 'weather-key');
        assert.equal(embed(interaction).description, 'Looks like something is wrong!');
        assert.deepEqual(embed(interaction).footer, {
            text: 'Error message: Weather service is unavailable. Please try again later.',
        });
        assert.equal(interaction.responses[0]?.payload.flags, MessageFlags.Ephemeral);
    }
});

await test('weather handles HTTP errors and failures without a response with private compatible embeds', async () => {
    for (const [failure, message] of [
        [new Error('offline'), 'Weather service is unavailable. Please try again later.'],
        [new TypeError('Connection failed'), 'Weather service is unavailable. Please try again later.'],
        [{ response: {} }, 'Weather service is unavailable. Please try again later.'],
        [{ response: { data: { cod: '404', message: 'city not found' } } }, '404 city not found'],
        [{ response: { data: { cod: 401, message: 'Invalid API key' } } }, '401 Invalid API key'],
    ] satisfies [unknown, string][]) {
        const interaction = await dispatch('weather', { get: () => Promise.reject(failure instanceof Error ? failure : Object.assign(new Error('HTTP failure'), failure)) }, 'weather-key');
        assert.deepEqual(embed(interaction), {
            color: 0xff0000, description: 'Looks like something is wrong!',
            footer: { text: `Error message: ${message}` },
        });
        assert.equal(interaction.responses[0]?.payload.flags, MessageFlags.Ephemeral);
    }
});


await test('weather uses Fahrenheit or Kelvin with the correct wind units and encodes location as one query value', async () => {
    for (const [units, temperature, wind] of [
        ['imperial', '20°F', '3.2mph'], ['kelvin', '20K', '3.2m/s'],
    ]) {
        const interaction = await dispatch('weather', { get: url => {
            const query = new URL(url).searchParams;
            assert.equal(query.get('q'), 'A&B #1? units=imperial');
            assert.equal(query.get('appid'), 'key&secret');
            assert.equal(query.get('units'), units);
            return Promise.resolve(forecast);
        } }, 'key&secret', units, 'A&B #1? units=imperial');
        assert.partialDeepStrictEqual(embed(interaction).fields, [
            {}, { value: temperature }, {}, { value: wind }, {}, {},
        ]);
    }
});

await test('image HTTP status failures preserve status replies without trusting arbitrary error bodies', async () => {
    for (const name of ['randomcat', 'randomdog']) {
        const interaction = await dispatch(name, { get: () => Promise.reject(Object.assign(new Error('HTTP failure'), {
            response: { status: 503, statusText: 'Service Unavailable', data: null },
        })) });
        assert.equal(embed(interaction).description, 'Error code: `503 Service Unavailable` ');
    }
});
