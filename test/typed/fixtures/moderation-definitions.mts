// Serialized definitions captured from the legacy commands before migration.
export const moderationDefinitions = [
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
