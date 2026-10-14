import assert from 'node:assert/strict';
import { startBot } from '../../src/application.mjs';
import { OfflineGateway, OfflineInteraction, startupEnvironment } from './discord.mjs';

const gateway = new OfflineGateway();
const errors: unknown[] = [];
await startBot({
    env: startupEnvironment, createGateway: () => gateway,
    reportError: error => { errors.push(error); },
});
for (const commandName of ['help', 'botinfo']) {
    const interaction = new OfflineInteraction();
    interaction.commandName = commandName;
    await gateway.dispatch(interaction);
    const response = interaction.responses[0];
    assert.equal(response?.method, 'reply');
    const embed = response.payload.embeds?.[0];
    assert.ok(embed && !('toJSON' in embed));
    if (commandName === 'help') assert.equal(embed.title, 'Bot Commands');
    else assert.ok(embed.fields?.some(field => field.name === '▶️ Bot Version' && field.value === '```3.0.0```'));
}
assert.deepEqual(errors, []);
