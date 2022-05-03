'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const moment = require('moment');
const ms = require('ms');

/**
 * This class is for handling the moderation commands
 */
class Moderation {
    constructor(interaction, action) {
        this.interaction = interaction;
        this.action = action;
    }

    async getAction() {
        let violator = this.interaction.options.getMember('target');
        if (!violator) return this.interaction.reply({
            content:   'Sorry! I can\'t find this user!',
            ephemeral: true
        });

        const user = await prisma.users.findUnique({
            where: {
                accountId: violator.user.id
            },
        });

        if (!user) {
            await this.createUser(violator);
        }

        if (violator) {
            switch (this.action) {
                case 'ban':
                    if (!violator.bannable && violator.id === this.interaction.client.user.id) {
                        const notBannable = {
                            color:       '#ff0000',
                            description: 'This user is not bannable!',
                            timestamp:   new Date(),
                            footer:      {
                                text: this.interaction.client.user.username,
                            },
                        };

                        return this.interaction.reply({ embeds: [notBannable], ephemeral: true });
                    }

                    await this.ban(violator);
                    break;
                case 'clean':
                    if (violator.id === this.interaction.client.user.id) {
                        const notClean = {
                            color:       '#ff0000',
                            description: 'Cannot clear messages from this user!',
                            timestamp:   new Date(),
                            footer:      {
                                text: this.interaction.client.user.username,
                            },
                        };

                        return this.interaction.reply({ embeds: [notClean], ephemeral: true });
                    }

                    await this.clean(violator);
                    break;
                case 'clearinfractions':
                    if (violator.id === this.interaction.client.user.id) {
                        const notBannable = {
                            color:       '#ff0000',
                            description: 'Cannot clear infractions from this user!',
                            timestamp:   new Date(),
                            footer:      {
                                text: this.interaction.client.user.username,
                            },
                        };

                        return this.interaction.reply({ embeds: [notBannable], ephemeral: true });
                    }

                    await this.clearinfractions(violator);
                    break;
                case 'kick':
                    if (!violator.kickable && violator.id === this.interaction.client.user.id) {
                        const notKickable = {
                            color:       '#ff0000',
                            description: 'This user is not kickable!',
                            timestamp:   new Date(),
                            footer:      {
                                text: this.interaction.client.user.username,
                            },
                        };

                        return this.interaction.reply({ embeds: [notKickable], ephemeral: true });
                    }

                    await this.kick(violator);
                    break;
                case 'mute':
                    if (violator.id !== this.interaction.client.user.id) {
                        await this.mute(violator);
                    } else {
                        const notMutable = {
                            color:       '#ff0000',
                            description: 'This user is not mutable!',
                            timestamp:   new Date(),
                            footer:      {
                                text: this.interaction.client.user.username,
                            },
                        };

                        return this.interaction.reply({ embeds: [notMutable], ephemeral: true });
                    }
                    break;
                case 'unban':
                    await this.unban(violator);
                    break;
                case 'unmute':
                    await this.unmute(violator);
                    break;
                case 'warn':
                    await this.warn(violator);
                    break;
            }
        }
    }

    /**
     * Ban a user from the Discord server
     * @param violator
     * @returns {Promise<*>}
     */
    async ban(violator) {
        let defaultReason = 'No reason provided';
        let days = this.interaction.options.getInteger('days')

        if (this.interaction.options.getString('reason')) {
            defaultReason = this.interaction.options.getString('reason')
        }

        const infractionChannel = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id
            },

            select: {
                guildId:         true,
                infractions_log: true,
            }
        });

        if (!infractionChannel) {
            try {
                const noChannelEmbed = {
                    color:       '#ff9900',
                    description: 'This user has been banned!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    thumbnail:   {
                        url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    fields:      [
                        {
                            name:   `Issued By`,
                            value:  `<@${this.interaction.user.id}>`,
                            inline: false,
                        },
                        {
                            name:   `User ID`,
                            value:  `${violator.id}`,
                            inline: true,
                        },
                        {
                            name:   `Reason`,
                            value:  `${defaultReason}\n`,
                            inline: false,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                await violator.ban({ reason: defaultReason, days: days })
                    .then(async () => {
                        await this.interaction.reply({ embeds: [noChannelEmbed] });

                        await prisma.Infractions.create({
                            data: {
                                guildId:   this.interaction.guild.id,
                                accountId: violator.id,
                                reason:    defaultReason,
                                type:      'ban',
                                expires:   null
                            }
                        });
                    });
            } catch (e) {
                console.error(e);
            }
        } else {
            const joinedServerAtDate = (new Date(violator.joinedAt).getTime() / 1000).toFixed(0);
            let mChannel = this.interaction.guild.channels.cache.get(infractionChannel.infractions_log);

            if (mChannel === typeof undefined) {
                const noInfractionChannel = {
                    color:       '#ff0000',
                    description: 'I could not find the infraction channel you have setup! Make sure it\'s setup correctly',
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                return this.interaction.reply({ embeds: [noInfractionChannel] });
            }

            try {
                const channelEmbed = {
                    color:       '#ff9900',
                    description: 'This user has been banned!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    thumbnail:   {
                        url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    fields:      [
                        {
                            name:   `Issued By`,
                            value:  `<@${this.interaction.user.id}>`,
                            inline: false,
                        },
                        {
                            name:   `Action`,
                            value:  'Ban',
                            inline: true,
                        },
                        {
                            name:   `User ID`,
                            value:  `\`${violator.id}\``,
                            inline: true,
                        },
                        {
                            name:   `Joined At`,
                            value:  `<t:${joinedServerAtDate}:R>`,
                            inline: true,
                        },
                        {
                            name:   `Reason`,
                            value:  `${defaultReason}\n`,
                            inline: false,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                const banEmbed = {
                    color:       '#ff9900',
                    description: 'That user has been banned!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                await violator.ban({ reason: defaultReason, days: days })
                    .then(async () => {
                        await mChannel.send({ embeds: [channelEmbed] });

                        await prisma.Infractions.create({
                            data: {
                                guildId:   this.interaction.guild.id,
                                accountId: violator.id,
                                reason:    defaultReason,
                                type:      'ban',
                                expires:   null
                            }
                        });

                        await this.interaction.reply({ embeds: [banEmbed], ephemeral: true });
                    });
            } catch (e) {
                console.error(e);
            }
        }
    };


    async clean(violator) {
        let defaultReason = 'No reason provided';

        if (this.interaction.options.getString('reason')) {
            defaultReason = this.interaction.options.getString('reason');
        }

        let amount = this.interaction.options.getInteger('amount');
        // if amount is less than 1 add 1 to the amount
        if (amount < 1) amount = 1;

        const infractionChannel = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                guildId:         true,
                infractions_log: true,
            }
        });

        const messages = await prisma.messages.findMany({
            where: {
                guildId:   this.interaction.guild.id,
                channelId: this.interaction.channel.id,
                accountId: violator.id,
            },

            orderBy: [
                {
                    id: 'desc'
                }
            ],

            take: amount
        });

        if (!messages.length) {
            return this.interaction.reply({
                content:   'Could not delete these messages because those messages arent stored in my database!',
                ephemeral: true
            });
        }

        let iMessage;

        await this.interaction.deferReply();

        try {
            for (let message of messages) {
                iMessage = await this.interaction.channel.messages.fetch(message.messageId);

                await iMessage.delete();

                await prisma.ChannelMessages.deleteMany({
                    where: {
                        messageId: message.messageId,
                    },
                });

                await prisma.Messages.deleteMany({
                    where: {
                        messageId: message.messageId,
                    },
                });
            }
        } catch (e) {
            console.error(e);
        }


        if (!infractionChannel) {
            try {
                const successClean = {
                    color:       '#00ff00',
                    title:       'Successfully deleted messages!',
                    description: `${amount} messages from <@${violator.id}> has been successfully deleted`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                }

                await this.interaction.editReply({ embeds: [successClean], ephemeral: true });
            } catch (e) {
                console.error(e)
            }
        } else {
            const joinedServerAtDate = (new Date(violator.joinedAt).getTime() / 1000).toFixed(0);
            let mChannel = this.interaction.guild.channels.cache.get(infractionChannel.infractions_log);

            if (mChannel === typeof undefined) {
                const noInfractionChannel = {
                    color:       '#ff0000',
                    description: 'I could not find the infraction channel you have setup! Make sure it\'s setup correctly',
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                return this.interaction.reply({ embeds: [noInfractionChannel] });
            }
            try {
                const channelEmbed = {
                    color:       '#ff9900',
                    description: 'Successfully deleted messages!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    thumbnail:   {
                        url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    fields:      [
                        {
                            name:   `Issued By`,
                            value:  `<@${this.interaction.user.id}>`,
                            inline: false,
                        },
                        {
                            name:   `Action`,
                            value:  'Clean',
                            inline: true,
                        },
                        {
                            name:   `User ID`,
                            value:  `\`${violator.id}\``,
                            inline: true,
                        },
                        {
                            name:   `Joined At`,
                            value:  `<t:${joinedServerAtDate}:R>`,
                            inline: true,
                        },
                        {
                            name:   `Reason`,
                            value:  `${defaultReason}\n`,
                            inline: false,
                        },
                        {
                            name:   `Amount of messages deleted`,
                            value:  `${amount}\n`,
                            inline: false,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                const successClean = {
                    color:       '#00ff00',
                    title:       'Successfully deleted messages!',
                    description: `${amount} message(s) from <@${violator.id}> has been successfully deleted`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await mChannel.send({ embeds: [channelEmbed] });

                await prisma.Infractions.create({
                    data: {
                        guildId:   this.interaction.guild.id,
                        accountId: violator.id,
                        reason:    defaultReason,
                        type:      'clean',
                        expires:   null
                    }
                });

                await this.interaction.editReply({ embeds: [successClean], ephemeral: true });

                try {
                    const cleanDMEmbed = {
                        color:       '#ffc107',
                        description: `${amount} of your messages in **${this.interaction.guild.name}** have been deleted for the following reason(s): \n\n${defaultReason}`,
                        timestamp:   new Date(),
                        footer:      {
                            text: this.interaction.client.user.username,
                        },
                    }

                    await violator.send({ embeds: [cleanDMEmbed], ephemeral: true })

                } catch {
                    console.log(`Failed to DM ${violator.tag}`)
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    async clearinfractions(violator) {
        let defaultReason = 'No reason provided';

        if (this.interaction.options.getString('reason')) {
            defaultReason = this.interaction.options.getString('reason')
        }

        let amount = this.interaction.options.getInteger('amount');
        // if amount is less than 1 add 1 to the amount
        if (amount < 1) amount = 1;

        const infractionChannel = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                guildId:         true,
                infractions_log: true,
            }
        });

        const userInfractions = await prisma.Infractions.findMany({
            where: {
                guildId:   this.interaction.guild.id,
                accountId: violator.id,
            },

            orderBy: [
                {
                    id: 'desc'
                }
            ],

            take: amount
        });

        if (userInfractions.length) {
            try {
                for (let infraction of userInfractions) {
                    await prisma.Infractions.delete({
                        where: {
                            id: infraction.id
                        }
                    });
                }

                if (!infractionChannel) {
                    const successCleanInfractions = {
                        color:       '#00ff00',
                        title:       'Successfully removed infractions!',
                        description: `${amount} infractions from <@${violator.id}> has been successfully removed!`,
                        timestamp:   new Date(),
                        footer:      {
                            text: this.interaction.client.user.username,
                        },
                    }

                    await this.interaction.reply({ embeds: [successCleanInfractions], ephemeral: true });
                } else {
                    const joinedServerAtDate = (new Date(violator.joinedAt).getTime() / 1000).toFixed(0);
                    let mChannel = this.interaction.guild.channels.cache.get(infractionChannel.infractions_log);

                    if (mChannel === typeof undefined) {
                        const noInfractionChannel = {
                            color:       '#ff0000',
                            description: 'I could not find the infraction channel you have setup! Make sure it\'s setup correctly',
                            timestamp:   new Date(),
                            footer:      {
                                text: this.interaction.client.user.username,
                            },
                        };

                        return this.interaction.reply({ embeds: [noInfractionChannel] });
                    }

                    const channelEmbed = {
                        color:       '#ff9900',
                        description: 'Successfully removed infractions!',
                        author:      {
                            name:     `${violator.user.tag}`,
                            icon_url: violator.displayAvatarURL({ dynamic: true }),
                        },
                        thumbnail:   {
                            url: violator.displayAvatarURL({ dynamic: true }),
                        },
                        fields:      [
                            {
                                name:   `Issued By`,
                                value:  `<@${this.interaction.user.id}>`,
                                inline: false,
                            },
                            {
                                name:   `Action`,
                                value:  'Clear Infractions',
                                inline: true,
                            },
                            {
                                name:   `User ID`,
                                value:  `\`${violator.id}\``,
                                inline: true,
                            },
                            {
                                name:   `Joined At`,
                                value:  `<t:${joinedServerAtDate}:R>`,
                                inline: true,
                            },
                            {
                                name:   `Reason`,
                                value:  `${defaultReason}\n`,
                                inline: false,
                            },
                            {
                                name:   `Amount of infractions deleted`,
                                value:  `${amount}\n`,
                                inline: false,
                            },
                        ],
                        timestamp:   new Date(),
                        footer:      {
                            text: this.interaction.client.user.username,
                        }
                    };

                    const successCleanInfractions = {
                        color:       '#00ff00',
                        title:       'Successfully removed infractions!',
                        description: `${amount} infractions from <@${violator.id}> has been successfully removed!`,
                        timestamp:   new Date(),
                        footer:      {
                            text: this.interaction.client.user.username,
                        },
                    };

                    await mChannel.send({ embeds: [channelEmbed] });
                    await this.interaction.reply({ embeds: [successCleanInfractions], ephemeral: true });

                    try {
                        const cleanDMEmbed = {
                            color:       '#ffc107',
                            description: `${amount} of your messages in **${this.interaction.guild.name}** have been deleted for the following reason(s): \n\n${defaultReason}`,
                            timestamp:   new Date(),
                            footer:      {
                                text: this.interaction.client.user.username,
                            },
                        }

                        await violator.send({ embeds: [cleanDMEmbed], ephemeral: true })

                    } catch {
                        console.log(`Failed to DM ${violator.tag}`)
                    }
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            const couldNotFindInfraction = {
                color: '#ff0000',
                description: 'There are no infraction stored for this user!',
                timestamp: new Date(),
                footer: {
                    text: this.interaction.client.user.username,
                }
            };

            await this.interaction.reply({ embeds: [couldNotFindInfraction], ephemeral: true });
        }
    };

    /**
     * Kick a user from the Discord server
     * @param violator
     * @returns {Promise<*>}
     */
    async kick(violator) {
        let defaultReason = 'No reason provided';

        if (this.interaction.options.getString('reason')) {
            defaultReason = this.interaction.options.getString('reason')
        }

        const infractionChannel = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                guildId:         true,
                infractions_log: true,
            }
        });

        if (!infractionChannel) {
            try {
                const noChannelEmbed = {
                    color:       '#ff9900',
                    description: 'This user has been kicked!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    thumbnail:   {
                        url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    fields:      [
                        {
                            name:   `Issued By`,
                            value:  `<@${this.interaction.user.id}>`,
                            inline: false,
                        },
                        {
                            name:   `User ID`,
                            value:  `${violator.id}`,
                            inline: true,
                        },
                        {
                            name:   `Reason`,
                            value:  `${defaultReason}\n`,
                            inline: false,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                await violator.kick([defaultReason])
                    .then(async () => {
                        await this.interaction.reply({ embeds: [noChannelEmbed] });

                        await prisma.Infractions.create({
                            data: {
                                guildId:   this.interaction.guild.id,
                                accountId: violator.id,
                                reason:    defaultReason,
                                type:      'kick',
                                expires:   null
                            }
                        });
                    });
            } catch (e) {
                console.error(e);
            }
        } else {
            const joinedServerAtDate = (new Date(violator.joinedAt).getTime() / 1000).toFixed(0);
            let mChannel = this.interaction.guild.channels.cache.get(infractionChannel.infractions_log);

            if (mChannel === typeof undefined) {
                const noInfractionChannel = {
                    color:       '#ff0000',
                    description: 'I could not find the infraction channel you have setup! Make sure it\'s setup correctly',
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                return this.interaction.reply({ embeds: [noInfractionChannel] });
            }

            try {
                const channelEmbed = {
                    color:       '#ff9900',
                    description: 'This user has been kicked!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    thumbnail:   {
                        url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    fields:      [
                        {
                            name:   `Issued By`,
                            value:  `<@${this.interaction.user.id}>`,
                            inline: false,
                        },
                        {
                            name:   `Action`,
                            value:  'Kick',
                            inline: true,
                        },
                        {
                            name:   `User ID`,
                            value:  `\`${violator.id}\``,
                            inline: true,
                        },
                        {
                            name:   `Joined At`,
                            value:  `<t:${joinedServerAtDate}:R>`,
                            inline: true,
                        },
                        {
                            name:   `Reason`,
                            value:  `${defaultReason}\n`,
                            inline: false,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                const kickEmbed = {
                    color:       '#ff9900',
                    description: 'That user has been kicked!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                await violator.kick([defaultReason])
                    .then(async () => {
                        await mChannel.send({ embeds: [channelEmbed] });

                        await prisma.Infractions.create({
                            data: {
                                guildId:   this.interaction.guild.id,
                                accountId: violator.id,
                                reason:    defaultReason,
                                type:      'kick',
                                expires:   null
                            }
                        });

                        await this.interaction.reply({ embeds: [kickEmbed], ephemeral: true });
                    });
            } catch (e) {
                console.error(e);
            }
        }
    };

    async mute(violator) {
        let defaultReason = 'No reason provided';
        let days = this.interaction.options.getInteger('days');

        if (this.interaction.options.getString('reason')) {
            defaultReason = this.interaction.options.getString('reason')
        }

        const infractionChannel = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                guildId:         true,
                infractions_log: true,
                mute_role:       true
            }
        });

        if (!infractionChannel.mute_role) {
            const noMuteRole = {
                color:       '#ff0000',
                description: `This server has not setup a mute role. Set one up with \`/set muterole\``,
                timestamp:   new Date(),
                footer:      {
                    text: this.interaction.client.user.username,
                },
            };

            return this.interaction.reply({ embeds: [noMuteRole], ephemeral: true });
        }

        if (violator.roles.cache.has(infractionChannel.mute_role)) {
            return this.interaction.reply({ content: `It looks like this user is already muted!`, ephemeral: true });
        }


        if (!infractionChannel) {
            try {
                const noChannelEmbed = {
                    color:       '#ff9900',
                    description: 'This user has been muted!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    thumbnail:   {
                        url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    fields:      [
                        {
                            name:   `Issued By`,
                            value:  `<@${this.interaction.user.id}>`,
                            inline: false,
                        },
                        {
                            name:   `User ID`,
                            value:  `${violator.id}`,
                            inline: true,
                        },
                        {
                            name:   `Reason`,
                            value:  `${defaultReason}\n`,
                            inline: false,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                if (days) {
                    await violator.roles.add(infractionChannel.mute_role)
                        .then(async () => {
                            setTimeout(async () => {
                                violator.roles.remove(infractionChannel.mute_role);

                                try {
                                    const unmuteDMEmbed = {
                                        color:       '#ffc107',
                                        description: `Your mute cool down is finished in **${this.interaction.guild.name}**`,
                                        timestamp:   new Date(),
                                        footer:      {
                                            text: this.interaction.client.user.username,
                                        },
                                    }

                                    await violator.send({ embeds: [unmuteDMEmbed] })
                                } catch {
                                    console.log(`Failed to DM ${violator.tag}`)
                                }
                            }, ms(`${days} days`));

                            await this.interaction.reply({ embeds: [noChannelEmbed] });

                            await prisma.Infractions.create({
                                data: {
                                    guildId:   this.interaction.guild.id,
                                    accountId: violator.id,
                                    reason:    defaultReason,
                                    type:      'mute',
                                    expires:   `${days} day(s)`
                                }
                            });

                            try {
                                const muteDMEmbed = {
                                    color:       '#ffc107',
                                    description: `You have been muted in **${this.interaction.guild.name}** for the following reason(s): \n\n${defaultReason}`,
                                    timestamp:   new Date(),
                                    footer:      {
                                        text: this.interaction.client.user.username,
                                    },
                                }

                                await violator.send({ embeds: [muteDMEmbed] })
                            } catch {
                                console.log(`Failed to DM ${violator.tag}`)
                            }
                        });
                } else {
                    await violator.roles.add(infractionChannel.mute_role)
                        .then(async () => {
                            await this.interaction.reply({ embeds: [noChannelEmbed] });

                            await prisma.Infractions.create({
                                data: {
                                    guildId:   this.interaction.guild.id,
                                    accountId: violator.id,
                                    reason:    defaultReason,
                                    type:      'mute',
                                    expires:   `${days} day(s)`
                                }
                            });
                        });
                }
            } catch (e) {
                console.error(e)
            }
        } else {
            const joinedServerAtDate = (new Date(violator.joinedAt).getTime() / 1000).toFixed(0);
            let mChannel = this.interaction.guild.channels.cache.get(infractionChannel.infractions_log);

            if (mChannel === typeof undefined) {
                const noInfractionChannel = {
                    color:       '#ff0000',
                    description: 'I could not find the infraction channel you have setup! Make sure it\'s setup correctly',
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                return this.interaction.reply({ embeds: [noInfractionChannel] });
            }

            try {
                const channelEmbed = {
                    color:       '#ff9900',
                    description: 'This user has been muted!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    thumbnail:   {
                        url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    fields:      [
                        {
                            name:   `Issued By`,
                            value:  `<@${this.interaction.user.id}>`,
                            inline: false,
                        },
                        {
                            name:   `Action`,
                            value:  'Mute',
                            inline: true,
                        },
                        {
                            name:   `User ID`,
                            value:  `\`${violator.id}\``,
                            inline: true,
                        },
                        {
                            name:   `Joined At`,
                            value:  `<t:${joinedServerAtDate}:R>`,
                            inline: true,
                        },
                        {
                            name:   `Reason`,
                            value:  `${defaultReason}`,
                            inline: true,
                        },
                        {
                            name:   `Expires`,
                            value:  `\`${days} day(s)\``,
                            inline: true,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                const muteEmbed = {
                    color:       '#ff9900',
                    description: 'That user has been muted!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                if (days) {
                    await violator.roles.add(infractionChannel.mute_role)
                        .then(async () => {
                            setTimeout(async () => {
                                violator.roles.remove(infractionChannel.mute_role);

                                try {
                                    const unmuteDMEmbed = {
                                        color:       '#ffc107',
                                        description: `Your mute cool down is finished in **${this.interaction.guild.name}**`,
                                        timestamp:   new Date(),
                                        footer:      {
                                            text: this.interaction.client.user.username,
                                        },
                                    }

                                    await violator.send({ embeds: [unmuteDMEmbed] })
                                } catch {
                                    console.log(`Failed to DM ${violator.tag}`)
                                }
                            }, ms(`${days} days`));

                            await prisma.Infractions.create({
                                data: {
                                    guildId:   this.interaction.guild.id,
                                    accountId: violator.id,
                                    reason:    defaultReason,
                                    type:      'mute',
                                    expires:   `${days} day(s)`
                                }
                            });

                            await mChannel.send({ embeds: [channelEmbed] });

                            await this.interaction.reply({ embeds: [muteEmbed] });

                            try {
                                const muteDMEmbed = {
                                    color:       '#ffc107',
                                    description: `You have been muted in **${this.interaction.guild.name}** for the following reason(s): \n\n${defaultReason}`,
                                    timestamp:   new Date(),
                                    footer:      {
                                        text: this.interaction.client.user.username,
                                    },
                                }

                                await violator.send({ embeds: [muteDMEmbed] })
                            } catch {
                                console.log(`Failed to DM ${violator.tag}`)
                            }
                        });
                } else {
                    await violator.roles.add(infractionChannel.mute_role)
                        .then(async () => {
                            await mChannel.send({ embeds: [channelEmbed] });

                            await prisma.Infractions.create({
                                data: {
                                    guildId:   this.interaction.guild.id,
                                    accountId: violator.id,
                                    reason:    defaultReason,
                                    type:      'mute',
                                    expires:   `${days} day(s)`
                                }
                            });

                            await this.interaction.reply({ embeds: [muteEmbed], ephemeral: true });

                            try {
                                const muteDMEmbed = {
                                    color:       '#ffc107',
                                    description: `You have been muted in **${this.interaction.guild.name}** for the following reason(s): \n\n${defaultReason}`,
                                    timestamp:   new Date(),
                                    footer:      {
                                        text: this.interaction.client.user.username,
                                    },
                                }

                                await violator.send({ embeds: [muteDMEmbed] })
                            } catch {
                                console.log(`Failed to DM ${violator.tag}`)
                            }
                        });
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    async unban(violator) {
        const infractionChannel = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                guildId:         true,
                infractions_log: true,
            }
        });

        if (!infractionChannel) {
            try {
                const noChannelEmbed = {
                    color:       '#ff9900',
                    description: 'This user has been unbanned!',
                    author:      {
                        name:     `${violator.username}#${violator.discriminator}`,
                        icon_url: violator.avatar,
                    },
                    thumbnail:   {
                        url: violator.avatar,
                    },
                    fields:      [
                        {
                            name:   `Issued By`,
                            value:  `<@${this.interaction.user.id}>`,
                            inline: false,
                        },
                        {
                            name:   `User ID`,
                            value:  `${violator.accountId}`,
                            inline: true,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                await this.interaction.guild.members.unban(violator.accountId)
                    .then(async () => {
                        await this.interaction.reply({ embeds: [noChannelEmbed] });

                        await prisma.Infractions.create({
                            data: {
                                guildId:   this.interaction.guild.id,
                                accountId: violator.accountId,
                                reason:    'No reason for unban',
                                type:      'unban',
                                expires:   null
                            }
                        });
                    })
                    .catch(async (e) => {
                        console.error(e);
                        const notBannedEmbed = {
                            color:       '#ff0033',
                            title:       'User not banned from this server',
                            description: `Cannot unban <@${violator.accountId}>, because that user is not banned from this server!`,
                            timestamp:   new Date(),
                            footer:      {
                                text: this.interaction.client.user.username,
                            },
                        };

                        await this.interaction.reply({ embeds: [notBannedEmbed], ephemeral: true });
                    });
            } catch (e) {
                console.error(e);
            }
        } else {
            let mChannel = this.interaction.guild.channels.cache.get(infractionChannel.infractions_log);

            if (mChannel === typeof undefined) {
                const noInfractionChannel = {
                    color:       '#ff0000',
                    description: 'I could not find the infraction channel you have setup! Make sure it\'s setup correctly',
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                return this.interaction.reply({ embeds: [noInfractionChannel] });
            }

            try {
                const channelEmbed = {
                    color:       '#ff9900',
                    description: 'This user has been unbanned!',
                    author:      {
                        name:     `${violator.username}#${violator.discriminator}`,
                        icon_url: violator.avatar,
                    },
                    thumbnail:   {
                        url: violator.avatar,
                    },
                    fields:      [
                        {
                            name:   `Issued By`,
                            value:  `<@${this.interaction.user.id}>`,
                            inline: false,
                        },
                        {
                            name:   `Action`,
                            value:  'Unban',
                            inline: true,
                        },
                        {
                            name:   `User ID`,
                            value:  `\`${violator.accountId}\``,
                            inline: true,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                const unbanEmbed = {
                    color:       '#ff9900',
                    description: 'That user has been unbanned!',
                    author:      {
                        name:     `${violator.username}#${violator.discriminator}`,
                        icon_url: violator.avatar,
                    },
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                await this.interaction.guild.members.unban(violator.accountId)
                    .then(async () => {
                        await mChannel.send({ embeds: [channelEmbed] });

                        await prisma.Infractions.create({
                            data: {
                                guildId:   this.interaction.guild.id,
                                accountId: violator.accountId,
                                reason:    'No reason for unban',
                                type:      'unban',
                                expires:   null
                            }
                        });

                        await this.interaction.reply({ embeds: [unbanEmbed], ephemeral: true });
                    })
                    .catch(async (e) => {
                        console.error(e)
                        const notBannedEmbed = {
                            color:       '#ff0033',
                            title:       'User not banned from this server',
                            description: `Cannot unban <@${violator.accountId}>, because that user is not banned from this server, or something else wrong happened?`,
                            timestamp:   new Date(),
                            footer:      {
                                text: this.interaction.client.user.username,
                            },
                        }

                        await this.interaction.reply({ embeds: [notBannedEmbed], ephemeral: true })
                    });
            } catch (e) {
                console.error(e);
            }
        }
    };

    async unmute(violator) {
        let defaultReason = 'No reason provided';

        if (this.interaction.options.getString('reason')) {
            defaultReason = this.interaction.options.getString('reason')
        }

        const infractionChannel = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                guildId:         true,
                infractions_log: true,
                mute_role:       true
            }
        });

        if (!infractionChannel.mute_role) {
            const noMuteRole = {
                color:       '#ff0000',
                description: `This server has not setup a mute role. Set one up with \`/set muterole\``,
                timestamp:   new Date(),
                footer:      {
                    text: this.interaction.client.user.username,
                },
            };

            return this.interaction.reply({ embeds: [noMuteRole], ephemeral: true });
        }

        if (!violator.roles.cache.has(infractionChannel.mute_role)) {
            return this.interaction.reply({ content: `It looks like this user is not muted!`, ephemeral: true });
        }

        if (!infractionChannel) {
            try {
                const noChannelEmbed = {
                    color:       '#ff9900',
                    description: 'This user has been unmuted!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    thumbnail:   {
                        url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    fields:      [
                        {
                            name:   `Issued By`,
                            value:  `<@${this.interaction.user.id}>`,
                            inline: false,
                        },
                        {
                            name:   `User ID`,
                            value:  `${violator.id}`,
                            inline: true,
                        },
                        {
                            name:   `Reason`,
                            value:  `${defaultReason}\n`,
                            inline: false,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                await violator.roles.remove(infractionChannel.mute_role)
                    .then(async () => {
                        await this.interaction.reply({ embeds: [noChannelEmbed] });

                        await prisma.Infractions.create({
                            data: {
                                guildId:   this.interaction.guild.id,
                                accountId: violator.id,
                                reason:    defaultReason,
                                type:      'unmute',
                                expires:   null
                            }
                        });

                        try {
                            const muteDMEmbed = {
                                color:       '#ffc107',
                                description: `You have been unmuted in **${this.interaction.guild.name}** for the following reason(s): \n\n${defaultReason}`,
                                timestamp:   new Date(),
                                footer:      {
                                    text: this.interaction.client.user.username,
                                },
                            };

                            await violator.send({ embeds: [muteDMEmbed] });
                        } catch {
                            console.log(`Failed to DM ${violator.tag}`);
                        }
                    });
            } catch (e) {
                console.error(e)
            }
        } else {
            const joinedServerAtDate = (new Date(violator.joinedAt).getTime() / 1000).toFixed(0);
            let mChannel = this.interaction.guild.channels.cache.get(infractionChannel.infractions_log);

            if (mChannel === typeof undefined) {
                const noInfractionChannel = {
                    color:       '#ff0000',
                    description: 'I could not find the infraction channel you have setup! Make sure it\'s setup correctly',
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                return this.interaction.reply({ embeds: [noInfractionChannel] });
            }

            try {
                await violator.roles.remove(infractionChannel.mute_role)
                    .then(async () => {
                        const channelEmbed = {
                            color:       '#ff9900',
                            description: 'This user has been unmuted!',
                            author:      {
                                name:     `${violator.user.tag}`,
                                icon_url: violator.displayAvatarURL({ dynamic: true }),
                            },
                            thumbnail:   {
                                url: violator.displayAvatarURL({ dynamic: true }),
                            },
                            fields:      [
                                {
                                    name:   `Issued By`,
                                    value:  `<@${this.interaction.user.id}>`,
                                    inline: false,
                                },
                                {
                                    name:   `Action`,
                                    value:  'Unmute',
                                    inline: true,
                                },
                                {
                                    name:   `User ID`,
                                    value:  `\`${violator.id}\``,
                                    inline: true,
                                },
                                {
                                    name:   `Joined At`,
                                    value:  `<t:${joinedServerAtDate}:R>`,
                                    inline: true,
                                },
                                {
                                    name:   `Reason`,
                                    value:  `${defaultReason}\n`,
                                    inline: false,
                                },
                            ],
                            timestamp:   new Date(),
                            footer:      {
                                text: this.interaction.client.user.username,
                            }
                        };

                        const unmuteEmbed = {
                            color:       '#ff9900',
                            description: 'That user has been unmuted!',
                            author:      {
                                name:     `${violator.user.tag}`,
                                icon_url: violator.displayAvatarURL({ dynamic: true }),
                            },
                            timestamp:   new Date(),
                            footer:      {
                                text: this.interaction.client.user.username,
                            }
                        };

                        await mChannel.send({ embeds: [channelEmbed] });

                        await prisma.Infractions.create({
                            data: {
                                guildId:   this.interaction.guild.id,
                                accountId: violator.id,
                                reason:    defaultReason,
                                type:      'unmute',
                                expires:   null
                            }
                        });

                        await this.interaction.reply({ embeds: [unmuteEmbed], ephemeral: true });

                        try {
                            const unmuteDMEmbed = {
                                color:       '#ffc107',
                                description: `You have been unmuted in **${this.interaction.guild.name}** for the following reason(s): \n\n${defaultReason}`,
                                timestamp:   new Date(),
                                footer:      {
                                    text: this.interaction.client.user.username,
                                },
                            }

                            await violator.send({ embeds: [unmuteDMEmbed] })

                        } catch {
                            console.log(`Failed to DM ${violator.tag}`)
                        }
                    });
            } catch (e) {
                console.error(e)
            }
        }
    };

    async warn(violator) {
        let defaultReason = 'No reason provided';

        if (this.interaction.options.getString('reason')) {
            defaultReason = this.interaction.options.getString('reason')
        }

        const infractionChannel = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                guildId:         true,
                infractions_log: true,
            }
        });

        if (!infractionChannel) {
            try {
                const noChannelEmbed = {
                    color:       '#ff9900',
                    description: 'This user has been warned!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    thumbnail:   {
                        url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    fields:      [
                        {
                            name:   `Issued By`,
                            value:  `<@${this.interaction.user.id}>`,
                            inline: false,
                        },
                        {
                            name:   `User ID`,
                            value:  `${violator.id}`,
                            inline: true,
                        },
                        {
                            name:   `Reason`,
                            value:  `${defaultReason}\n`,
                            inline: false,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                await this.interaction.reply({ embeds: [noChannelEmbed] });

                await prisma.Infractions.create({
                    data: {
                        guildId:   this.interaction.guild.id,
                        accountId: violator.id,
                        reason:    defaultReason,
                        type:      'warning',
                        expires:   null
                    }
                });
            } catch (e) {
                console.error(e);
            }
        } else {
            const joinedServerAtDate = (new Date(violator.joinedAt).getTime() / 1000).toFixed(0);
            let mChannel = this.interaction.guild.channels.cache.get(infractionChannel.infractions_log);

            if (mChannel === typeof undefined) {
                const noInfractionChannel = {
                    color:       '#ff0000',
                    description: 'I could not find the infraction channel you have setup! Make sure it\'s setup correctly',
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                return this.interaction.reply({ embeds: [noInfractionChannel] });
            }

            try {
                const channelEmbed = {
                    color:       '#ff9900',
                    description: 'This user has been warned!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    thumbnail:   {
                        url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    fields:      [
                        {
                            name:   `Issued By`,
                            value:  `<@${this.interaction.user.id}>`,
                            inline: false,
                        },
                        {
                            name:   `Action`,
                            value:  'Warning',
                            inline: true,
                        },
                        {
                            name:   `User ID`,
                            value:  `\`${violator.id}\``,
                            inline: true,
                        },
                        {
                            name:   `Joined At`,
                            value:  `<t:${joinedServerAtDate}:R>`,
                            inline: true,
                        },
                        {
                            name:   `Reason`,
                            value:  `${defaultReason}\n`,
                            inline: false,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                const kickEmbed = {
                    color:       '#ff9900',
                    description: 'That user has been warned!',
                    author:      {
                        name:     `${violator.user.tag}`,
                        icon_url: violator.displayAvatarURL({ dynamic: true }),
                    },
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    }
                };

                await mChannel.send({ embeds: [channelEmbed] });

                await prisma.Infractions.create({
                    data: {
                        guildId:   this.interaction.guild.id,
                        accountId: violator.id,
                        reason:    defaultReason,
                        type:      'warning',
                        expires:   null
                    }
                });

                await this.interaction.reply({ embeds: [kickEmbed], ephemeral: true });

                try {
                    const warnDMEmbed = {
                        color:       '#ffc107',
                        description: `You have been warned in **${this.interaction.guild.name}** for the following reason(s): \n\n${defaultReason}`,
                        timestamp:   new Date(),
                        footer:      {
                            text: this.interaction.client.user.username,
                        },
                    }

                    await violator.send({ embeds: [warnDMEmbed] })

                } catch {
                    console.log(`Failed to DM ${violator.tag}`)
                }
            } catch (e) {
                console.error(e);
            }
        }
    };

    async createUser(violator) {
        let createdTimestamp = violator.createdTimestamp;
        createdTimestamp = moment(createdTimestamp).format('YYYY-MM-DD HH-mm-ss');

        await prisma.users.create({
            data: {
                accountId:        violator.user.id,
                username:         violator.user.username,
                discriminator:    violator.user.discriminator,
                avatar:           violator.user.avatarURL({ dynamic: true }),
                bot:              violator.user.bot,
                createdTimestamp: createdTimestamp
            }
        });

        return 'User has been created';
    }
}

module.exports = Moderation;
