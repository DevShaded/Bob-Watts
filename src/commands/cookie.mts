import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../contracts.mjs';
import { randomChoice } from './random-choice.mjs';
import { botUser } from './bot-user.mjs';

export const cookie: Command = {
    category: 'Fun',
    data: new SlashCommandBuilder()
        .setName('cookie')
        .setDescription('Returns a fortune cookie message'),
    async execute(interaction) {
        // create an array with fortune cookies
        const answer = randomChoice([
            'Someone is looking up to you. Don\'t let that person down.',
            'run.',
            'No snowflake in an avalanche ever feels responsible.',
            'About time I got out of that cookie.',
            'IF YOU EAT SOMETHING & NOBODY SEES YOU EAT IT, IT HAS NO CALORIES',
            'Someone in your life needs a letter from you.',
            'Soon you will receive a letter from a loved one.',
            'Never do anything halfway.',
            'A new romance is in the future.',
            'Ignore previous cookie.',
            'I cannot help you, for I am just a cookie. :)',
            'You will mary a professional athlete - if competitive eating can be considered a sport.',
            'Help! I am being held prisoner in a cookie factory.',
            'You don\'t have to be faster than the bear, you just have to be faster than the slowest fuy running from it.',
            'You look pretty. :)',
            'In youth and beauty, wisdom is rare. :)',
            'Ask not what your fortune cookie can do for you but what you can do for your fortune cookie.',
            'Enjoy yourself while you can.',
            'You are not illiterate.',
            'If you think we\'re going to sum up your whole life on this little piece of message embed you\'re crazy',
            'HELP ME NOW PLEASE! jk, I don\'t need help! Just a bot haha'
        ]);
        await interaction.reply({ embeds: [{
            color: 0x17a2b8,
            description: `:fortune_cookie: <@${interaction.user.id}>, ${answer}`,
            timestamp: new Date().toISOString(),
            footer: { text: botUser(interaction).username },
        }] });
    },
};
