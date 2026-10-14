import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { botUser } from './bot-user.mjs';
import { randomChoice } from './random-choice.mjs';

export const rps: Command = {
    category: 'Fun',
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Game: Rock, Paper, Scissors')
        .addStringOption(option =>
            option.setName('tool')
                .setDescription('Your tools use one of the following: rock, paper, scissors')
                .addChoices({
                        "name":  'Rock',
                        "value": "rock"
                    },
                    {
                        "name":  "Paper",
                        "value": "paper"
                    },
                    {
                        "name":  "Scissors",
                        "value": "scissors"
                    })
                .setRequired(true)),
    async execute(interaction) {
        const tool = interaction.options.getString('tool');
        const answer = randomChoice(['rock', 'paper', 'scissors']);
        let responseMessage: string;

        // This needs improvements ASAP
        if (answer === tool) {
            responseMessage = `<@${interaction.user.id}>, we have a draw. My hand was **${tool}**`;
        } else if (answer === 'rock' && tool === 'paper') {
            responseMessage = `<@${interaction.user.id}>, you won. My hand was **Rock**`;
        } else if (answer === 'rock' && tool === 'scissors') {
            responseMessage = `<@${interaction.user.id}>, you lost. My hand was **Rock**`;
        } else if (answer === 'scissors' && tool === 'rock') {
            responseMessage = `<@${interaction.user.id}>, you won. My hand was **Scissors**`;
        } else if (answer === 'scissors' && tool === 'paper') {
            responseMessage = `<@${interaction.user.id}>, you lost. My hand was **Scissors**`;
        } else if (answer === 'paper' && tool === 'rock') {
            responseMessage = `<@${interaction.user.id}>, you lost. My hand was **Paper**`;
        } else if (answer === 'paper' && tool === 'scissors') {
            responseMessage = `<@${interaction.user.id}>, you won. My hand was **Paper**`;
        } else {
            throw new Error('Unsupported rock-paper-scissors hand.');
        }

        await interaction.reply({ embeds: [{
            color: 0x17a2b8,
            description: responseMessage,
            timestamp: new Date().toISOString(),
            footer: { text: botUser(interaction).username },
        }] });
    },
};
