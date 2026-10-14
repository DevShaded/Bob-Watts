'use strict';

const prisma = require('../Database');

class VerificationLevel {
    constructor(interaction, level) {
        this.interaction = interaction;
        this.level = level
    }

    async getUser() {
        const user = await prisma.moderators.findFirst({
            where: {
                guildId:   this.interaction.guild.id,
                accountId: this.interaction.user.id
            },
        });

        if (user) {
            return this.level >= user.level;
        }
    }
}

module.exports = VerificationLevel;
