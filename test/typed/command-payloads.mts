// Independent expected Discord payloads retained from the established command behavior.
export const expectedCommandPayloads = [
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
    {
        "options": [],
        "name": "serverinfo",
        "description": "Returns a message with server information",
        "type": 1
    },
    {
        "options": [],
        "name": "randomcat",
        "description": "Get a picture of a random cat!",
        "type": 1
    },
    {
        "options": [],
        "name": "randomdog",
        "description": "Get a picture of a random dog!",
        "type": 1
    },
    {
        "options": [
            {
                "type": 3,
                "name": "location",
                "description": "Choose the location where you want weather forecast from!",
                "required": true
            },
            {
                "type": 3,
                "choices": [
                    {
                        "name": "Metric (Celsius)",
                        "value": "metric"
                    },
                    {
                        "name": "Imperial (Fahrenheit)",
                        "value": "imperial"
                    },
                    {
                        "name": "Kelvin",
                        "value": "kelvin"
                    }
                ],
                "name": "units",
                "description": "Your tools use one of the following: rock, paper, scissors",
                "required": true
            }
        ],
        "name": "weather",
        "description": "Get the current weather forecast for a location",
        "type": 1
    },
    {
        "options": [
            {
                "type": 1,
                "name": "joinchannel",
                "description": "Set a custom join log channel for this server",
                "options": [
                    {
                        "name": "channel",
                        "description": "Here you can set the channel",
                        "required": true,
                        "type": 7
                    }
                ]
            },
            {
                "type": 1,
                "name": "leavechannel",
                "description": "Set a custom leave log channel for this server",
                "options": [
                    {
                        "name": "channel",
                        "description": "Here you can set the channel",
                        "required": true,
                        "type": 7
                    }
                ]
            },
            {
                "type": 1,
                "name": "editchannel",
                "description": "Set a custom edit log channel for this server",
                "options": [
                    {
                        "name": "channel",
                        "description": "Here you can set the channel",
                        "required": true,
                        "type": 7
                    }
                ]
            },
            {
                "type": 1,
                "name": "deletechannel",
                "description": "Set a custom delete log channel for this server",
                "options": [
                    {
                        "name": "channel",
                        "description": "Here you can set the channel",
                        "required": true,
                        "type": 7
                    }
                ]
            },
            {
                "type": 1,
                "name": "infractionchannel",
                "description": "Set a custom infraction log channel for moderation",
                "options": [
                    {
                        "name": "channel",
                        "description": "Here you can set the channel",
                        "required": true,
                        "type": 7
                    }
                ]
            },
            {
                "type": 1,
                "name": "muterole",
                "description": "Set a custom mute role for this server",
                "options": [
                    {
                        "name": "role",
                        "description": "Here you can set the custom role",
                        "required": true,
                        "type": 8
                    }
                ]
            },
            {
                "type": 1,
                "name": "autorole",
                "description": "Set a custom auto role for this server",
                "options": [
                    {
                        "name": "role",
                        "description": "Here you can set the custom role",
                        "required": true,
                        "type": 8
                    }
                ]
            },
            {
                "type": 1,
                "name": "welcomemessage",
                "description": "Set a custom welcome message for new members in this server",
                "options": [
                    {
                        "type": 3,
                        "name": "message",
                        "description": "Here you can set the custom message (Custom emojis WILL NOT WORK)",
                        "required": true
                    }
                ]
            },
            {
                "type": 1,
                "name": "goodbyemessage",
                "description": "Set a custom goodbye message for new members in this server",
                "options": [
                    {
                        "type": 3,
                        "name": "message",
                        "description": "Here you can set the custom message (Custom emojis WILL NOT WORK)",
                        "required": true
                    }
                ]
            }
        ],
        "name": "set",
        "description": "This command is to set pre-defined settings",
        "type": 1
    },
    {
        "options": [
            {
                "type": 1,
                "name": "joinchannel",
                "description": "Remove the custom join log channel for this server",
                "options": []
            },
            {
                "type": 1,
                "name": "leavechannel",
                "description": "Remove the custom leave log channel for this server",
                "options": []
            },
            {
                "type": 1,
                "name": "editchannel",
                "description": "Remove the custom edit log channel for this server",
                "options": []
            },
            {
                "type": 1,
                "name": "deletechannel",
                "description": "Remove the custom delete log channel for this server",
                "options": []
            },
            {
                "type": 1,
                "name": "infractionchannel",
                "description": "Remove the custom infraction log channel for moderation",
                "options": []
            },
            {
                "type": 1,
                "name": "muterole",
                "description": "Remove the custom mute role for this server",
                "options": []
            },
            {
                "type": 1,
                "name": "autorole",
                "description": "Remove the custom auto role for this server",
                "options": []
            },
            {
                "type": 1,
                "name": "welcomemessage",
                "description": "Remove the custom welcome message for this server",
                "options": []
            },
            {
                "type": 1,
                "name": "goodbyemessage",
                "description": "Remove the custom goodbye message for this server",
                "options": []
            }
        ],
        "name": "remove",
        "description": "This command is to set pre-defined settings",
        "type": 1
    },
    {
        "options": [
            {
                "type": 1,
                "name": "softmoderator",
                "description": "Add a soft moderator to the servers moderation list",
                "options": [
                    {
                        "name": "target",
                        "description": "Choose the user you want to make soft moderator",
                        "required": true,
                        "type": 6
                    }
                ]
            },
            {
                "type": 1,
                "name": "moderator",
                "description": "Add a moderator to the servers moderation list",
                "options": [
                    {
                        "name": "target",
                        "description": "Choose the user you want to make moderator",
                        "required": true,
                        "type": 6
                    }
                ]
            },
            {
                "type": 1,
                "name": "administrator",
                "description": "Add a administrator to the servers moderation list",
                "options": [
                    {
                        "name": "target",
                        "description": "Choose the user you want to make administrator",
                        "required": true,
                        "type": 6
                    }
                ]
            }
        ],
        "name": "add",
        "description": "This command is to set pre-defined settings",
        "type": 1
    },
    {
        "options": [
            {
                "type": 1,
                "name": "softmoderator",
                "description": "Delete a soft moderator from the servers moderation list",
                "options": [
                    {
                        "name": "target",
                        "description": "Choose the user you want to delete",
                        "required": true,
                        "type": 6
                    }
                ]
            },
            {
                "type": 1,
                "name": "moderator",
                "description": "Delete a moderator from the servers moderation list",
                "options": [
                    {
                        "name": "target",
                        "description": "Choose the user you want to delete",
                        "required": true,
                        "type": 6
                    }
                ]
            },
            {
                "type": 1,
                "name": "administrator",
                "description": "Delete a administrator from the servers moderation list",
                "options": [
                    {
                        "name": "target",
                        "description": "Choose the user you want to delete",
                        "required": true,
                        "type": 6
                    }
                ]
            }
        ],
        "name": "delete",
        "description": "This command is to set pre-defined settings",
        "type": 1
    },
    {
        "options": [
            {
                "name": "target",
                "description": "Choose the user you want to ban from your server",
                "required": true,
                "type": 6
            },
            {
                "type": 4,
                "choices": [
                    {
                        "name": "0 Days",
                        "value": 0
                    },
                    {
                        "name": "1 Days",
                        "value": 1
                    },
                    {
                        "name": "2 Days",
                        "value": 2
                    },
                    {
                        "name": "3 Days",
                        "value": 3
                    },
                    {
                        "name": "4 Days",
                        "value": 4
                    },
                    {
                        "name": "5 Days",
                        "value": 5
                    },
                    {
                        "name": "6 Days",
                        "value": 6
                    },
                    {
                        "name": "7 Days",
                        "value": 7
                    }
                ],
                "name": "days",
                "description": "Delete message history",
                "required": true
            },
            {
                "type": 3,
                "name": "reason",
                "description": "Specify a reason why you want to ban this user",
                "required": false
            }
        ],
        "name": "ban",
        "description": "Ban a member from your server",
        "type": 1
    },
    {
        "options": [
            {
                "name": "target",
                "description": "Choose the user you want to clean messages from your server",
                "required": true,
                "type": 6
            },
            {
                "type": 4,
                "name": "amount",
                "description": "Choose how many messages you want delete from that user",
                "required": true
            },
            {
                "type": 3,
                "name": "reason",
                "description": "Specify a reason why you want to remove messages from this user",
                "required": false
            }
        ],
        "name": "clean",
        "description": "Remove a certain amount of message from a user in the server",
        "type": 1
    },
    {
        "options": [
            {
                "name": "target",
                "description": "Choose the user you want to clear infractions from your server",
                "required": true,
                "type": 6
            },
            {
                "type": 4,
                "name": "amount",
                "description": "Choose the amount of infractions you want to clear from this user",
                "required": true
            },
            {
                "type": 3,
                "name": "reason",
                "description": "Specify a reason why you want to clear the infractions from this user",
                "required": false
            }
        ],
        "name": "clearinfractions",
        "description": "Clear a certain amount of infractions of the mentioned user in a server",
        "type": 1
    },
    {
        "options": [
            {
                "name": "target",
                "description": "Choose the user you want to get infractions from",
                "required": true,
                "type": 6
            }
        ],
        "name": "infractions",
        "description": "Get all infractions of the mentioned user in a server",
        "type": 1
    },
    {
        "options": [
            {
                "name": "target",
                "description": "Choose the user you want to kick from your server",
                "required": true,
                "type": 6
            },
            {
                "type": 3,
                "name": "reason",
                "description": "Specify a reason why you want to kick this user",
                "required": false
            }
        ],
        "name": "kick",
        "description": "Kick the mentioned user from the server",
        "type": 1
    },
    {
        "options": [
            {
                "name": "target",
                "description": "Choose the user you want to mute in your server",
                "required": true,
                "type": 6
            },
            {
                "type": 4,
                "name": "days",
                "description": "How many days do you want to mute this user for?",
                "required": false
            },
            {
                "type": 3,
                "name": "reason",
                "description": "Specify a reason why you want to mute this user",
                "required": false
            }
        ],
        "name": "mute",
        "description": "Mute a member from your server",
        "type": 1
    },
    {
        "options": [
            {
                "type": 3,
                "name": "target",
                "description": "Enter the UserID from the user that was banned",
                "required": true
            }
        ],
        "name": "unban",
        "description": "Unban a user that has been banned from your server",
        "type": 1
    },
    {
        "options": [
            {
                "name": "target",
                "description": "Choose the user you want to unmute from your server",
                "required": true,
                "type": 6
            },
            {
                "type": 3,
                "name": "reason",
                "description": "Specify a reason why you want to unmute this user",
                "required": false
            }
        ],
        "name": "unmute",
        "description": "Unmute a member from your server",
        "type": 1
    },
    {
        "options": [
            {
                "name": "target",
                "description": "Choose the user you want to kick from a voice channel",
                "required": true,
                "type": 6
            },
            {
                "type": 3,
                "name": "reason",
                "description": "Specify a reason why you want to kick this user",
                "required": false
            }
        ],
        "name": "vckick",
        "description": "Kick the mentioned user from a voice channel",
        "type": 1
    },
    {
        "options": [
            {
                "name": "target",
                "description": "Choose the user you want to warn from your server",
                "required": true,
                "type": 6
            },
            {
                "type": 3,
                "name": "reason",
                "description": "Specify a reason why you want to warn this user",
                "required": false
            }
        ],
        "name": "warn",
        "description": "Warn a member from your server",
        "type": 1
    }
];
