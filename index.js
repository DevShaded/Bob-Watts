'use strict';

// Require the necessary discord.js classes
const { Client, GatewayIntentBits, Partials, Events, ActivityType, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

// Require dotenv to read the .env file
require('dotenv').config({ quiet: true });

// Require Prisma for the database
const prisma = require('./App/Database');

// The necessary classes the application uses
const Message = require('./App/Discord/Message');

// Create a new client instance
const client = new Client({
    // Necessary intents permissions
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildExpressions,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping
    ],

    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ],

    allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
});

client.commands = new Collection();
const fs = require('fs');

// Discord Event handler
try {
    /**
     * Our event folders
     * Guild    -> Guild Events         -> App/Events/Guild
     * Member   -> Guild Member Events  -> App/Events/Member
     *
     * @type {string[][]}
     */
    const registerEventFolders = [
        ['Guild'],
        ['Member'],
    ];

    for (let registerEventFolder of registerEventFolders) {
        const eventFile = fs.readdirSync('./App/Events/' + [registerEventFolder])
            .filter(file => file.endsWith('.js'));

        for (const file of eventFile) {
            const event = require('./App/Events/' + [registerEventFolder] + '/' + file);

            // Check if the event wants to run once or on
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
} catch (e) {
    console.error('Cloud not load event files', e);
}

// Discord Slash Commands handler
try {
    /**
     * Our slash commands folders
     *
     * Fun          -> Fun Slash Commands        -> Commands/Fun
     * Moderation   -> Moderation Slash Commands -> Commands/Moderation
     * Public       -> Public Slash Commands     -> Commands/Public
     *
     * @type {string[][]}
     */
    const registerSlashCommandFolders = [
        ['Fun'],
        ['Information'],
        ['Moderation'],
        ['Public'],
        ['Settings']
    ];

    for (let registerSlashCommandFolder of registerSlashCommandFolders) {
        const commandFiles = fs.readdirSync('./Commands/' + registerSlashCommandFolder)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require('./Commands/' + registerSlashCommandFolder + '/' + file);
            client.commands.set(command.name, command);
        }
    }
} catch (e) {
    console.error('Cloud not load Slash Commands', e);
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async () => {
    console.log('\x1b[32mBot has succesfully signed in and is listening to events\x1b[0m');

    const botActivity = await prisma.bot.findMany({
        orderBy: [
            {
                id: 'desc'
            }
        ],
    });

    if (!botActivity.length) {
        await client.user.setActivity('devshaded.com/bobwatts', { type: ActivityType.Watching });
    } else {
        const activity = botActivity[0];
        const activityTypes = {
            PLAYING: ActivityType.Playing, STREAMING: ActivityType.Streaming,
            LISTENING: ActivityType.Listening, WATCHING: ActivityType.Watching,
            CUSTOM: ActivityType.Custom, COMPETING: ActivityType.Competing,
        };
        client.user.setActivity(activity.name, {
            type: activityTypes[activity.type] ?? ActivityType.Playing,
            url: activity.url ?? undefined,
        });
    }
});

// Interaction Create - Emitted when an interaction is created.
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    const slashCommand = client.commands.get(commandName);
    if (!slashCommand) return;

    try {
        await slashCommand.execute(interaction);
    } catch (error) {
        console.error(error);
        const response = { content: 'Well that didn\'t work, try another command maybe?' };
        if (interaction.deferred && !interaction.replied) {
            await interaction.editReply(response);
        } else if (interaction.replied) {
            await interaction.followUp({ ...response, flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ ...response, flags: MessageFlags.Ephemeral });
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.webhookId) return;

    if (message.guild) {
        const messageClass = new Message(message);
        await messageClass.getMessage();
    }

    if (message.content.startsWith('!help')) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://devshaded.com/bobwatts')
                    .setLabel('Invite Link'),
            );

        const embed = {
            color: 0x17a2b8,
            title: 'Announcement',
            description: 'As of <t:1654293600:F>, the Bob Watts dev team has decided to remove message commands, and replaced them with slash commands. If you can\'t find any slash commands from Bob Watts, then you need to re-add the bot to the server!',
            timestamp: new Date().toISOString(),
            footer:      {
                text: client.user.username
            }
        };

        await message.reply({embeds: [embed], components: [row]});
    }
});

if (process.env.APP_ENV === 'TRUE') {
    client.on('debug', console.log)
        .on('warn', console.log);
}

// Login to Discord with your client's token
switch (process.env.APP_ENV) {
    case 'development':
        client.login(process.env.APP_TOKEN).then(() => {
            console.log('\x1b[33mBot is trying to sign in as DEVELOPER\x1b[0m');
        })
        break
    case 'production':
        client.login(process.env.APP_TOKEN).then(() => {
            console.log('\x1b[36mBot is trying to sign in as PRODUCTION\x1b[0m');
        })
        break
    default:
        console.error('Environment has not been set up correctly');
}
