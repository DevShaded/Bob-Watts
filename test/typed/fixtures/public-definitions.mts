// Serialized definitions captured from the legacy commands before migration.
export const publicDefinitions = [
    {
        "options": [
            {
                "type": 3,
                "name": "message",
                "description": "Type your fortune message!",
                "required": true
            }
        ],
        "name": "8ball",
        "description": "Ask a question and get an answer from the magic 8 ball",
        "type": 1
    },
    {
        "options": [],
        "name": "coinflip",
        "description": "Flips a coin and return either Heads or Tails",
        "type": 1
    },
    {
        "options": [],
        "name": "cookie",
        "description": "Returns a fortune cookie message",
        "type": 1
    },
    {
        "options": [],
        "name": "diceroll",
        "description": "Dice roll, returns a number between 1 and 6",
        "type": 1
    },
    {
        "options": [
            {
                "name": "user",
                "description": "Mention the user who you want to give a hug to",
                "required": true,
                "type": 6
            }
        ],
        "name": "hug",
        "description": "Hug the mentioned user",
        "type": 1
    },
    {
        "options": [
            {
                "name": "user",
                "description": "Mention the user who you want to give a kiss to",
                "required": true,
                "type": 6
            }
        ],
        "name": "kiss",
        "description": "Kiss the mentioned user",
        "type": 1
    },
    {
        "options": [
            {
                "type": 3,
                "choices": [
                    {
                        "name": "Rock",
                        "value": "rock"
                    },
                    {
                        "name": "Paper",
                        "value": "paper"
                    },
                    {
                        "name": "Scissors",
                        "value": "scissors"
                    }
                ],
                "name": "tool",
                "description": "Your tools use one of the following: rock, paper, scissors",
                "required": true
            }
        ],
        "name": "rps",
        "description": "Game: Rock, Paper, Scissors",
        "type": 1
    },
    {
        "options": [
            {
                "name": "user",
                "description": "Mention the user who you want to slap",
                "required": true,
                "type": 6
            }
        ],
        "name": "slap",
        "description": "Hug the mentioned user",
        "type": 1
    },
    {
        "options": [],
        "name": "botinfo",
        "description": "Display information of the client/bot itself",
        "type": 1
    },
    {
        "options": [],
        "name": "help",
        "description": "Returns a message with all of the commands available from the bot",
        "type": 1
    },
    {
        "options": [],
        "name": "ping",
        "description": "Returns a message with a response time message",
        "type": 1
    },
    {
        "options": [
            {
                "name": "user",
                "description": "Choose the user you want to get info about!",
                "required": true,
                "type": 6
            }
        ],
        "name": "userinfo",
        "description": "Display information about the mentioned user in a server",
        "type": 1
    },
    { "options": [], "name": "serverinfo", "description": "Returns a message with server information", "type": 1 }
];
