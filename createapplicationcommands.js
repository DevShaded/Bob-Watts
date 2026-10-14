require('dotenv').config({ quiet: true })

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');

// Place your client and guild ids here
const clientId = process.env.APP_CLIENT_ID;
const guildId = process.env.APP_GUILD_ID;

const rest = new REST({ version: '10' }).setToken(process.env.APP_TOKEN);

(async () => {
    try {
        if (!['development', 'production'].includes(process.env.APP_ENV)) {
            throw new Error('Set APP_ENV to development or production in .env.');
        }

        const required = ['APP_TOKEN', 'APP_CLIENT_ID'];
        if (process.env.APP_ENV === 'development') required.push('APP_GUILD_ID');
        const missing = required.filter(name => !process.env[name]?.trim());
        if (missing.length) {
            throw new Error(`Missing .env values: ${missing.join(', ')}`);
        }

        const commands = [];

        const registerSlashCommandFolders = [
            ['Fun'],
            ['Information'],
            ['Moderation'],
            ['Public'],
            ['Settings'],
        ];

        for (let registerSlashCommandFolder of registerSlashCommandFolders) {
            const commandFiles = fs.readdirSync('./Commands/' + registerSlashCommandFolder)
                .filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = require('./Commands/' + registerSlashCommandFolder + '/' + file);
                commands.push(command.data.toJSON());
            }
        }

        console.log('Started refreshing application (/) commands.');

        switch (process.env.APP_ENV) {
            case 'production':
                await rest.put(
                    Routes.applicationCommands(clientId),
                    { body: commands },
                );
                break;
            case 'development':
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commands },
                );
                break;
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
})();
