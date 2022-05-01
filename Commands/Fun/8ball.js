'use strict';

const { SlashCommandBuilder } = require('@discordjs/builders');

const data = new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask a question and get an answer from the magic 8 ball')
    .addStringOption(option =>
        option.setName('message')
            .setDescription('Type your fortune message!')
            .setRequired(true));


module.exports = {
    data:        data,
    name:        '8ball',
    description: 'Ask a question and get an answer from the magic 8 ball.',
    execute:     async (interaction) => {
        const fortune = [
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
        ];

        let answer = Math.floor(Math.random() * fortune.length);

        const message = interaction.options.getString('message');

        const embed = {
            color:       '#17a2b8',
            description: `:8ball: <@${interaction.user.id}>, ${fortune[answer]}`,
            footer:      {
                text: `Original message: ${message}`
            }
        };

        await interaction.reply({ embeds: [embed] });
    },
};
