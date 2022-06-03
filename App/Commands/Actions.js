'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Actions {
    constructor(interaction) {
        this.interaction = interaction
    }

    /**
     * This is method allows a custom join log channel to be set
     *
     * @returns {Promise<void>}
     */
    async setJoinChannel() {
        const getJoinChannel = this.interaction.options.getChannel('channel');

        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },
        });

        if (!getGuildLog) {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Join log channel setup success!',
                    description: `${getJoinChannel} will now log user joins!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.create({
                    data: {
                        guildId:     this.interaction.guild.id,
                        welcome_log: getJoinChannel.id,
                    }
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Join log channel setup did not succeed!',
                    description: `${getJoinChannel} will not log user joins!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Join log channel setup success!',
                    description: `${getJoinChannel} will now log user joins!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        welcome_log: getJoinChannel.id,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Join log channel setup did not succeed!',
                    description: `${getJoinChannel} will not log user joins!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    };

    /**
     * This method allows a custom leave log channel to be set
     *
     * @returns {Promise<void>}
     */
    async setLeaveChannel() {
        const getLeaveChannel = this.interaction.options.getChannel('channel');

        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },
        });

        if (!getGuildLog) {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Leave log channel setup success!',
                    description: `${getLeaveChannel} will now log user leaves!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.create({
                    data: {
                        guildId:     this.interaction.guild.id,
                        goodbye_log: getLeaveChannel.id,
                    }
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Leave log channel setup did not succeed!',
                    description: `${getLeaveChannel} will not log user leaves!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Leave log channel setup success!',
                    description: `${getLeaveChannel} will now log user leaves!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        goodbye_log: getLeaveChannel.id,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Leave log channel setup did not succeed!',
                    description: `${getLeaveChannel} will not log user joins!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    };

    /**
     * This method allows a custom edit log channel to be set
     *
     * @returns {Promise<void>}
     */
    async setEditChannel() {
        const getEditChannel = this.interaction.options.getChannel('channel');

        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },
        });

        if (!getGuildLog) {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Edit log channel setup success!',
                    description: `${getEditChannel} will now log user edits!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.create({
                    data: {
                        guildId:  this.interaction.guild.id,
                        edit_log: getEditChannel.id,
                    }
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Edit log channel setup did not succeed!',
                    description: `${getEditChannel} will not log user edits!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Edit log channel setup success!',
                    description: `${getEditChannel} will now log user edits!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        edit_log: getEditChannel.id,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Edit log channel setup did not succeed!',
                    description: `${getEditChannel} will not log user edits!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    };

    /**
     * This method allows a custom delete log channel to be set
     *
     * @returns {Promise<void>}
     */
    async setDeleteChannel() {
        const getDeleteChannel = this.interaction.options.getChannel('channel');

        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },
        });

        if (!getGuildLog) {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Delete log channel setup success!',
                    description: `${getDeleteChannel} will now log user deletes!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.create({
                    data: {
                        guildId:    this.interaction.guild.id,
                        delete_log: getDeleteChannel.id,
                    }
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Delete log channel setup did not succeed!',
                    description: `${getDeleteChannel} will not log user deletes!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Delete log channel setup success!',
                    description: `${getDeleteChannel} will now log user deletes!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        delete_log: getDeleteChannel.id,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Delete log channel setup did not succeed!',
                    description: `${getDeleteChannel} will not log user deletes!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    };

    /**
     * This method allows a custom infraction log channel to be set
     *
     * @returns {Promise<void>}
     */
    async setInfractionChannel() {
        const getInfractionsChannel = this.interaction.options.getChannel('channel');

        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },
        });

        if (!getGuildLog) {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Infraction log channel setup success!',
                    description: `${getInfractionsChannel} will now log user infractions!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.create({
                    data: {
                        guildId:         this.interaction.guild.id,
                        infractions_log: getInfractionsChannel.id,
                    }
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Infraction log channel setup did not succeed!',
                    description: `${getInfractionsChannel} will not log user infractions!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Infraction log channel setup did not succeed!',
                    description: `${getInfractionsChannel} will now log user infractions!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        infractions_log: getInfractionsChannel.id,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Infraction log channel setup did not succeed!',
                    description: `${getInfractionsChannel} will not log user infractions!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    };

    /**
     * This method allows a custom mute role to be set
     *
     * @returns {Promise<void>}
     */
    async setMuteRole() {
        const getMuteRole = this.interaction.options.getRole('role');

        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },
        });

        if (!getGuildLog) {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Mute role setup success!',
                    description: `${getMuteRole} is ready for use!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.create({
                    data: {
                        guildId:   this.interaction.guild.id,
                        mute_role: getMuteRole.id,
                    }
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Mute role setup did not succeed!',
                    description: `${getMuteRole} is not ready for use!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Mute role setup success!',
                    description: `${getMuteRole} is ready for use!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        mute_role: getMuteRole.id,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Mute role setup did not succeed!',
                    description: `${getMuteRole} is not ready for use!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    };

    /**
     * This method allows a custom auto role to be set
     *
     * @returns {Promise<void>}
     */
    async setAutoRole() {
        const getAutoRole = this.interaction.options.getRole('role');

        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },
        });

        if (!getGuildLog) {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Auto role setup success!',
                    description: `${getAutoRole} is ready for use!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.create({
                    data: {
                        guildId:   this.interaction.guild.id,
                        join_role: getAutoRole.id,
                    }
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Auto role setup did not succeed!',
                    description: `${getAutoRole} is not ready for use!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Auto role setup success!',
                    description: `${getAutoRole} is ready for use!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        join_role: getAutoRole.id,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Auto role setup did not succeed!',
                    description: `${getAutoRole} is not ready for use!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    }

    /**
     * This method allows you to set a new welcome message for the guild
     *
     * @returns {Promise<void>}
     */
    async setWelcomeMessage() {
        const getWelcomeMessage = this.interaction.options.getString('message');

        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },
        });

        if (!getGuildLog) {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Welcome message setup success!',
                    description: `Welcome message is ready for use!`,
                    fields:      [
                        {
                            name:  'Current Welcome message',
                            value: `${getWelcomeMessage}`,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.create({
                    data: {
                        guildId:         this.interaction.guild.id,
                        welcome_message: getWelcomeMessage,
                    }
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Welcome message setup did not succeed!',
                    description: `Welcome message is not ready for use!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Welcome message setup success!',
                    description: `Welcome message is ready for use!`,
                    fields:      [
                        {
                            name:  'Current Welcome message',
                            value: `${getWelcomeMessage}`,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        welcome_message: getWelcomeMessage,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Welcome message setup did not succeed!',
                    description: `Welcome message is not ready for use!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    }

    /**
     * This method allows you to set a new goodbye message for the guild
     *
     * @returns {Promise<void>}
     */
    async setGoodbyeMessage() {
        const getGoodbyeMessage = this.interaction.options.getString('message');

        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },
        });

        if (!getGuildLog) {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Goodbye message setup success!',
                    description: `Goodbye message is ready for use!`,
                    fields:      [
                        {
                            name:  'Current Goodbye message',
                            value: `${getGoodbyeMessage}`,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.create({
                    data: {
                        guildId:         this.interaction.guild.id,
                        goodbye_message: getGoodbyeMessage,
                    }
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Goodbye message setup did not succeed!',
                    description: `Goodbye message is not ready for use!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Goodbye message setup success!',
                    description: `Goodbye message is ready for use!`,
                    fields:      [
                        {
                            name:  'Current Goodbye message',
                            value: `${getGoodbyeMessage}`,
                        },
                    ],
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        goodbye_message: getGoodbyeMessage,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Goodbye message setup did not succeed!',
                    description: `Goodbye message is not ready for use!`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    }

    /**
     * This method allows us to remove (set it to null) the join channel in the database
     *
     * @returns {Promise<void>}
     */
    async removeJoinChannel() {
        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                welcome_log: true
            }
        });

        if (!getGuildLog || getGuildLog.welcome_log == null) {
            try {
                const notSuccessEmbed = {
                    color:       '#ff0000',
                    title:       'Could not find join channel!',
                    description: `It looks like you haven't setup the join channel at all`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [notSuccessEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Join log channel deletion did not succeed!',
                    description: `Bob Watts was not able to delete the join channel`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Join channel has been removed!',
                    description: `Bob Watts will now stop logging user joins`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        welcome_log: null,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Join log channel deletion did not succeed!',
                    description: `Bob Watts was not able to delete the join channel`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    }

    /**
     * This method allows us to remove (set it to null) the leave channel from the database
     *
     * @returns {Promise<void>}
     */
    async removeLeaveChannel() {
        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                goodbye_log: true
            }
        });

        if (!getGuildLog || getGuildLog.goodbye_log == null) {
            try {
                const notSuccessEmbed = {
                    color:       '#ff0000',
                    title:       'Could not find leave channel!',
                    description: `It looks like you haven't setup the leave channel at all`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [notSuccessEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Leave log channel deletion did not succeed!',
                    description: `Bob Watts was not able to delete the leave channel`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Leave channel has been removed!',
                    description: `Bob Watts will now stop logging user leaves`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        goodbye_log: null,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Leave log channel deletion did not succeed!',
                    description: `Bob Watts was not able to delete the leave channel`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    }

    /**
     * This method allows us to remove (set it to null) the edit channel from the database
     *
     * @returns {Promise<void>}
     */
    async removeEditChannel() {
        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                edit_log: true
            }
        });

        if (!getGuildLog || getGuildLog.edit_log == null) {
            try {
                const notSuccessEmbed = {
                    color:       '#ff0000',
                    title:       'Could not find edit channel!',
                    description: `It looks like you haven't setup the edit channel at all`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [notSuccessEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Edit log channel deletion did not succeed!',
                    description: `Bob Watts was not able to delete the edit channel`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Edit channel has been removed!',
                    description: `Bob Watts will now stop logging edits`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        edit_log: null,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Edit log channel deletion did not succeed!',
                    description: `Bob Watts was not able to delete the edit channel`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    }

    /**
     * This method allows us to remove (set it to null) the delete channel from the database
     *
     * @returns {Promise<void>}
     */
    async removeDeleteChannel() {
        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                delete_log: true
            }
        });

        if (!getGuildLog || getGuildLog.delete_log == null) {
            try {
                const notSuccessEmbed = {
                    color:       '#ff0000',
                    title:       'Could not find delete channel!',
                    description: `It looks like you haven't setup the delete channel at all`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [notSuccessEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Delete log channel deletion did not succeed!',
                    description: `Bob Watts was not able to remove the delete channel`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Delete channel has been removed!',
                    description: `Bob Watts will now stop logging deletes`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        delete_log: null,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Delete log channel deletion did not succeed!',
                    description: `Bob Watts was not able to remove the delete channel`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    }

    /**
     * This method allows us to remove (set it to null) the infraction channel from the database
     *
     * @returns {Promise<void>}
     */
    async removeInfractionChannel() {
        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                infractions_log: true
            }
        });

        if (!getGuildLog || getGuildLog.infractions_log == null) {
            try {
                const notSuccessEmbed = {
                    color:       '#ff0000',
                    title:       'Could not find infraction channel!',
                    description: `It looks like you haven't setup the infraction channel at all`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [notSuccessEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Infraction log channel deletion did not succeed!',
                    description: `Bob Watts was not able to remove the infraction channel`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Infraction channel has been removed!',
                    description: `Bob Watts will now stop logging moderation infractions`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        infractions_log: null,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Infraction log channel deletion did not succeed!',
                    description: `Bob Watts was not able to remove the infraction channel`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    }

    /**
     * This method allows us to remove (set it to null) the mute role from the database
     *
     * @returns {Promise<void>}
     */
    async removeMuteRole() {
        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                mute_role: true
            }
        });

        if (!getGuildLog || getGuildLog.mute_role == null) {
            try {
                const notSuccessEmbed = {
                    color:       '#ff0000',
                    title:       'Could not find mute role!',
                    description: `It looks like you haven't setup the mute role at all`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [notSuccessEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Mute role deletion did not succeed!',
                    description: `Bob Watts was not able to remove the mute role`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Mute role has been removed!',
                    description: `Bob Watts will now stop using this mute role`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        mute_role: null,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Mute role deletion did not succeed!',
                    description: `Bob Watts was not able to remove the mute role`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    }

    /**
     * This method allows us to remove (set it to null) the auto role from the database
     *
     * @returns {Promise<void>}
     */
    async removeAutoRole() {
        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                join_role: true
            }
        });

        if (!getGuildLog || getGuildLog.join_role == null) {
            try {
                const notSuccessEmbed = {
                    color:       '#ff0000',
                    title:       'Could not find auto role!',
                    description: `It looks like you haven't setup the mute role at all`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [notSuccessEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Auto role deletion did not succeed!',
                    description: `Bob Watts was not able to remove the auto role`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Auto role has been removed!',
                    description: `Bob Watts will now stop using this auto role`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        join_role: null,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Auto role deletion did not succeed!',
                    description: `Bob Watts was not able to remove the auto role`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    }

    /**
     * This method allows us to remove (set it to null) the welcome message from the database
     *
     * @returns {Promise<void>}
     */
    async removeWelcomeMessage() {
        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                welcome_message: true
            }
        });

        if (!getGuildLog || getGuildLog.welcome_message == null) {
            try {
                const notSuccessEmbed = {
                    color:       '#ff0000',
                    title:       'Could not find welcome message!',
                    description: `It looks like you haven't setup the welcome message at all`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [notSuccessEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Welcome message deletion did not succeed!',
                    description: `Bob Watts was not able to remove the welcome message`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Welcome message has been removed!',
                    description: `Bob Watts will now stop using this welcome message`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        welcome_message: null,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Welcome message deletion did not succeed!',
                    description: `Bob Watts was not able to remove the welcome message`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    }

    /**
     * This method allows us to remove (set it to null) the goodbye message from the database
     *
     * @returns {Promise<void>}
     */
    async removeGoodbyeMessage() {
        const getGuildLog = await prisma.GuildLogs.findUnique({
            where: {
                guildId: this.interaction.guild.id,
            },

            select: {
                goodbye_message: true
            }
        });

        if (!getGuildLog || getGuildLog.goodbye_message == null) {
            try {
                const notSuccessEmbed = {
                    color:       '#ff0000',
                    title:       'Could not find goodbye message!',
                    description: `It looks like you haven't setup the goodbye message at all`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [notSuccessEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Goodbye message deletion did not succeed!',
                    description: `Bob Watts was not able to remove the goodbye message`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        } else {
            try {
                const successEmbed = {
                    color:       '#28a745',
                    title:       'Goodbye message has been removed!',
                    description: `Bob Watts will now stop using this goodbye message`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await prisma.GuildLogs.update({
                    where: {
                        guildId: this.interaction.guild.id,
                    },

                    data: {
                        goodbye_message: null,
                    },
                });

                await this.interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (e) {
                console.error(e);
                const failEmbed = {
                    color:       '#ff0000',
                    title:       'Goodbye message deletion did not succeed!',
                    description: `Bob Watts was not able to remove the goodbye message`,
                    timestamp:   new Date(),
                    footer:      {
                        text: this.interaction.client.user.username,
                    },
                };

                await this.interaction.reply({ embeds: [failEmbed], ephemeral: true });
            }
        }
    }
}

module.exports = Actions;
