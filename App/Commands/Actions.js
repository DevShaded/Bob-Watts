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
}

module.exports = Actions;