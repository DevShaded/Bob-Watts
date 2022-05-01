'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class VerificationLevel {
    constructor(interaction, level) {
        this.interaction = interaction;
        this.level = level
    }

    async getUser() {
        const user = await prisma.Moderators.findFirst({
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
