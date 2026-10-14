import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { randomChoice } from './random-choice.mjs';

export const eightBall: Command = {
    category: 'Fun',
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask a question and get an answer from the magic 8 ball')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Type your fortune message!')
                .setRequired(true)),
    async execute(interaction) {
        const answer = randomChoice([
            'It is Certain.',
            'It is decidedly so.',
            'Without a doubt.',
            'Yes definitely.',
            'You may rely on it',
            'As I see it, yes.',
            'Most likely.',
            'Outlook good.',
            'Yes.',
            'Signs point to yes.',
            'Reply hazy, try again.',
            'Ask again later',
            'Better not tell you now.',
            'Cannot predict now.',
            'Concentrate and ask again.',
            'Don\'t count on it.',
            'My reply is no.',
            'My sources say no.',
            'Outlook not so good.',
            'Very doubtful'
        ]);
        const message = interaction.options.getString('message');
        if (message === null) throw new Error('Missing required fortune message.');
        await interaction.reply({ embeds: [{
            color: 0x17a2b8,
            description: `:8ball: <@${interaction.user.id}>, ${answer}`,
            footer: { text: `Original message: ${message}` },
        }] });
    },
};
