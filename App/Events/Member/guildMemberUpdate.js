'use strict';

const GuildMember = require("../../Discord/GuildMember");

module.exports = {
    name:    'guildMemberUpdate',
    once:    false,
    execute: async (oldMember, newMember) => {
        if (newMember.guild.available) {
            try {
                const guildClass = new GuildMember(newMember);
                await guildClass.getGuildMember();
            } catch (e) {
                console.error(e);
            }
        }
    },
};
