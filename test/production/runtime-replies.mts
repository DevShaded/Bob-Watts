import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import packageMetadata from '../../package.json' with { type: 'json' };
import { OfflineGateway, OfflineInteraction, startupEnvironment } from '../typed/discord.mts';

// Import only production output after leaving the repository working directory.
// Node 24 runs this harness directly, without compiling tests into dist/.
process.chdir(tmpdir());
const { startBot } = await import('#compiled-application');
const gateway = new OfflineGateway();
const errors: unknown[] = [];
const bot = await startBot({
    env: startupEnvironment, createGateway: () => gateway,
    reportError: error => { errors.push(error); },
});
try {
    for (const commandName of ['help', 'botinfo']) {
        const interaction = new OfflineInteraction();
        interaction.commandName = commandName;
        await gateway.dispatch(interaction);
        const response = interaction.responses[0];
        assert.equal(interaction.responses.length, 1);
        assert.equal(response?.method, 'reply');
        const embed = response.payload.embeds?.[0];
        assert.ok(embed && !('toJSON' in embed));
        if (commandName === 'help') {
            assert.equal(embed.title, 'Bot Commands');
            assert.ok(embed.fields?.some(field => field.value.includes('`/help`')));
        } else {
            const version = embed.fields?.find(field => field.name === '▶️ Bot Version');
            assert.equal(version?.value, `\`\`\`${packageMetadata.version}\`\`\``);
        }
    }
    assert.deepEqual(errors, []);
} finally {
    await bot.destroy();
}
