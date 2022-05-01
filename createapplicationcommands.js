/**
 * NOT READY FOR USE YET
 */

// require('dotenv').config()
//
// const { REST } = require('@discordjs/rest');
// const { Routes } = require('discord-api-types/v9');
// const fs = require('node:fs');
//
// // Place your client and guild ids here
// const clientId = process.env.APP_CLIENT_ID;
// const guildId = process.env.APP_GUILD_ID;
//
// const rest = new REST({ versions: '9' }).setToken(process.env.APP_TOKEN);
//
// (async () => {
//     try {
//         const commands = [];

        // const registerSlashCommandFolders = [
        //     ['Fun'],
        // ];
        //
        // for (let registerSlashCommandFolder of registerSlashCommandFolders) {
        //     const commandFiles = fs.readdirSync('./Commands/' + registerSlashCommandFolder)
        //         .filter(file => file.endsWith('.js'));
        //
        //     for (const file of commandFiles) {
        //         const command = require('./Commands/' + registerSlashCommandFolder + '/' + file);
        //         console.log(command.data)
        //         commands.push(command.data);
        //     }
        // }

//         const command = require(`./Commands/Fun/8ball`);
//         console.log(command.data)
//         commands.push(command.data.toJSON());
//
//         console.log('Started refreshing application (/) commands.');
//
//         await rest.put(
//             Routes.applicationGuildCommands(clientId, guildId),
//             { body: commands },
//         );
//
//         console.log('Successfully reloaded application (/) commands.');
//     } catch (error) {
//         console.error(error);
//     }
// })();
