// Serialized definitions captured from the legacy Settings commands before migration.
export const settingsDefinitions = [
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
    }
];
