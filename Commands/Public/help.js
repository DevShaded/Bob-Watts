'use strict';

const path = require('path');
const fs = require('fs');
const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    name:        'help',
    description: 'Returns a message with all of the commands available from the bot',
    execute:     async (interaction) => {

        let funCommands = fs.readdirSync('./Commands/Fun');
        let informationCommands = fs.readdirSync('./Commands/Information');
        let moderationCommands = fs.readdirSync('./Commands/Moderation');
        let publicCommands = fs.readdirSync('./Commands/Public');
        let settingsCommands = fs.readdirSync('./Commands/Settings');

        let funCommandsList = [];
        let informationCommandsList = [];
        let moderationCommandsList = [];
        let publicCommandsList = [];
        let settingsCommandsList = [];

        let command;

        for (let i = 0; i < funCommands.length; i++) {
            command = path.parse(funCommands[i]);
            funCommandsList.push(`\`/${command.name}\``);
        }

        for (let i = 0; i < informationCommands.length; i++) {
            command = path.parse(informationCommands[i]);
            informationCommandsList.push(`\`/${command.name}\``);
        }

        for (let i = 0; i < moderationCommands.length; i++) {
            command = path.parse(moderationCommands[i]);
            moderationCommandsList.push(`\`/${command.name}\``);
        }

        for (let i = 0; i < publicCommands.length; i++) {
            command = path.parse(publicCommands[i]);
            publicCommandsList.push(`\`/${command.name}\``);
        }

        for (let i = 0; i < settingsCommands.length; i++) {
            command = path.parse(settingsCommands[i]);
            settingsCommandsList.push(`\`/${command.name}\``);
        }
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle('LINK')
                    .setURL('https://discord.gg/jfCv4XAfHA')
                    .setLabel('Support Server'),
            );


        const embed = {
            title:       'Bot Commands',
            color:       `#17a2b8`,
            description: 'Here are all of the commands that are available from Bob Watts!',
            fields:      [
                {
                    name:   '😀 Fun',
                    value:  funCommandsList.join('\n'),
                    inline: true
                },
                {
                    name:   '🛡️ Moderation',
                    value:  moderationCommandsList.join('\n'),
                    inline: true
                },
                {
                    name:   '👥 Public',
                    value:  publicCommandsList.join('\n'),
                    inline: true
                },
                {
                    name:   '⚙️ Settings',
                    value:  settingsCommandsList.join('\n'),
                    inline: true
                },
                {
                    name:   'ℹ️ Information',
                    value:  informationCommandsList.join('\n'),
                    inline: true
                },
                {
                    name:   'Hope this helps!',
                    value:  'I really hope it does',
                    inline: true
                },
            ],
            timestamp:   new Date(),
            footer:      {
                text: interaction.client.user.username,
            }
        };

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
