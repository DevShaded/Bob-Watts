# TypeScript migration plan

Status: specified in [GitHub issue #26](https://github.com/DevShaded/Bob-Watts/issues/26), including confirmed testing boundaries. Implementation is in progress; the complete conversion still requires the remaining checkpoints and final integration.

The [architecture decision](adr/0001-typescript-migration.md) records the agreed scope and trade-offs.

## Agreed outcome

- Convert application code, command-registration and setup scripts, and tests to TypeScript in one complete migration, developed in verifiable checkpoints.
- Enable strict type checking and enforce it in CI.
- Compile JavaScript for production and migrate the project to ES modules.
- Use explicit typed command and event registries. Startup, registration, and help share the command definitions and category metadata.
- Prohibit `any`, unchecked casts, and type-check suppression comments in maintained code and tests. Third-party and generated declarations are outside that prohibition; unsafe library results enter maintained code as `unknown` and are validated before use.
- Fix bugs discovered during conversion. Changes to behavior require a clear defect and a regression check; ambiguous product behavior remains a question for the user.

## Implementation checkpoints

1. Configure the TypeScript compiler for Node 24 and ES modules, separate generated output from source files, and add type-aware linting to enforce the prohibition on unsafe escapes.
2. Establish typed configuration, database, Discord interaction, command, and event boundaries. Replace import-time runtime initialization with explicit startup functions and narrow dependencies that tests can provide safely.
3. Convert application modules, commands, events, and scripts. Build the shared registries and validate external API fields before use. Preserve help categories and command visibility while deriving names from command definitions.
4. Convert tests, replace CommonJS cache manipulation, and add focused regression coverage for migration-sensitive behavior and discovered defects.
5. Update npm scripts, Prisma configuration, PM2 configuration, CI, and contributor instructions for the compiled application. Prisma configuration can become TypeScript; PM2's data-only configuration can become JSON.

## Compatibility requirements

- Configuration validation follows the entrypoint: application startup, command registration, setup checks, and dependency installation have different requirements.
- Dependency installation and Prisma generation work before an environment file exists. Setup checks do not require Discord credentials.
- Weather credentials remain optional. Unavailable weather configuration or malformed external responses produce controlled command failures.
- Existing slash command definitions, permission rules, help category order, and historical database enum values remain compatible, except where a verified defect requires a documented correction.
- Direct Node and PM2 execution use compiled output. Runtime paths, including package-version lookup, work from that output.

## Completion checks

- A clean installation, Prisma generation, strict type check, type-aware lint, production build, and offline tests succeed.
- CI runs the type check, lint, build, and tests.
- The current baseline of 10 passing offline tests remains covered, with ESM-compatible tests for startup and registration.
- Registry checks cover all 30 existing commands, category metadata, registration payloads, and dispatch contracts.
- Focused tests cover malformed external data, errors without HTTP responses, optional configuration, and each additional bug fixed during conversion.
- Built entrypoints and configuration are exercised without contacting Discord or changing a production database. Live bot verification, if needed, is a separate operational step.


## Information commands checkpoint (#30)

The typed registry now includes `randomcat`, `randomdog`, and `weather`. Their legacy JavaScript implementations remain for comparison until #34.

HTTP transport is a narrow `get(url): Promise<unknown>` dependency, optionally supplied to `startBot` and exposed through command context. Commands validate every consumed response field before building Discord payloads. Weather receives the optional `APP_WEATHER_API` setting through startup configuration; absent or blank credentials produce a private unavailable reply without an HTTP request.

Behavior corrections covered by dispatch regressions:

- Cat, dog, and weather failures no longer dereference a missing HTTP error response. Malformed bodies and connection failures produce controlled replies; validated HTTP status or weather error details remain visible when available.
- Image commands reject missing, malformed, oversized, or non-HTTP image URLs before constructing Discord buttons.
- Weather encodes the location and API key as individual query values, preventing location punctuation from changing other query parameters.
- Kelvin forecasts display wind speed in `m/s`; the legacy `K/m` label was not a speed unit.

Valid embeds, image link buttons, weather rounding, slash definitions, and help visibility remain compatible. Offline tests enter through startup/dispatch or registration using the shared registry.

## Settings commands checkpoint (#31)

The typed registry includes `set`, `remove`, `add`, and `delete`, with serialized definitions checked against their legacy counterparts. Legacy `Commands` and `App` implementations remain until #34.

Settings use the shared moderator-level verifier: Discord administrators and stored level 1 administrators can manage settings and moderator levels. Existing level values, targeted deletion, private responses, target DMs, guild/user initialization, nested guild settings, timestamp formats, and historical enum strings remain compatible.

`startBot` accepts a narrow `SettingsDatabase` substitute. Command context exposes `getDatabase()`; production creates and shares its Prisma client only when a command needs persistence. Discord contracts include only the guild metadata, member permissions, user DM capabilities, and option lookups consumed by these commands.

Behavior corrections covered through dispatch:

- Missing settings resources receive private responses. Channels without message support cannot be stored as log destinations.
- Updating an infraction channel reports setup success after a successful write; the legacy update branch incorrectly used a failure title.
- Removing an unconfigured auto role identifies the auto role; the legacy response incorrectly named the mute role.
- Discord reply failures after successful settings writes reach application error handling instead of being caught and reported as database failures. Database write failures retain their operation-specific private responses.

Offline tests cover authorization across all four commands, every setting's creation/update/removal fields, missing configuration, moderator level replacement and exact-level deletion, blocked DMs, initialization relationships and stored enum values, and guild/global registration payloads.

## Moderation commands checkpoint (#32)

All ten Moderation commands are registered as strict TypeScript definitions, with every option checked against captured legacy serialization. `Commands` and `App` remain unchanged for comparison until #34. Discord permission alternatives, stored moderator levels, bot self-protections, infraction type strings, zero-day ban history, notifications, and configured logging remain covered through startup/dispatch.

Command context exposes a narrow moderation database provider, member resolver, scheduler, and error reporter. Production resolves real guild members through the Discord gateway and shares the owned Prisma client with settings and event persistence. Tests supply those external capabilities without pretending permission-only members are full Discord members. The database opens lazily and closes when the gateway shuts down.

Behavior corrections covered through dispatch:

- Stored moderators can unban by string account ID without resolving a guild member. Unknown-ban responses remain controlled.
- Ban and kick reject every ineligible member; the legacy guard incorrectly required that member to also be the bot.
- Missing mute settings, missing or non-message log channels, and disconnected voice members no longer cause unchecked resource access.
- New user timestamps come from the Discord user rather than a nonexistent member creation timestamp; unknown member join dates display as unknown.
- Replies respect unanswered, deferred, and answered interactions. Cleaning selects private visibility when deferring and reports failures without claiming deletion succeeded.
- Cleaning and infraction clearing report the number actually removed. Infraction-clear notifications correctly identify infractions rather than messages.
- Long histories use bounded embed fields and private follow-ups. Displayed reasons respect Discord field and description limits while stored reasons remain intact.
- Mute durations reject invalid values, split delays beyond Node's timer limit, and store indefinite expiration as `null` rather than strings such as `null day(s)`.
- Completed action records are persisted before optional logging, so a log-send failure does not discard the infraction. Closed DMs do not hide successful moderation.

Timed mutes retain the existing in-memory scheduling model; restarting the process still loses pending timers. Discord actions and database writes remain separate external operations.

## Guild, member, and message checkpoint (#33)

The typed application registers all seven existing guild/member events, plus message delivery, client readiness, and interaction dispatch. Readiness remains one-time; the other events repeat. `/serverinfo` joins the shared Public command registry. Legacy JavaScript remains until #34.

`startBot` accepts a narrow `Persistence` capability for event writes, stored guild information, logging settings, and the latest bot activity. Command context exposes that capability as `persistence`. The Discord gateway provides `sendLog` and `getGuildInformation`; their contracts describe only sendable-channel operations and the guild, presence count, and role IDs needed by this slice. Event resources use narrow structural types, including nullable users on partial member removals. Tests supply those declared capabilities rather than incomplete Discord instances. Production settings commands and event persistence share one lazily created Prisma client.

Guild, settings, user, member, channel, thread, message, and message-association writes retain the Prisma schema and historical enum strings. Activity selection retains the stored type mappings, unknown-type Playing fallback, and default Watching activity. Bot/webhook messages remain ignored; direct-message `!help` retains the announcement and invitation button. Logging guild/channel IDs are optional at startup; development command registration still requires its target guild ID.

Behavior corrections covered through startup event delivery or command dispatch:

- Missing welcome logging no longer prevents the configured join role from being applied.
- Thread messages create the channel row required by their message relationship; thread owners are persisted before their thread relationship. Archived dates become valid stored strings, and nullable member join dates remain null.
- Uncached message members and partial member removals no longer require unavailable member/user properties.
- `/serverinfo` handles absent guilds and settings with a private unavailable response, reloads initialized settings, supplies emoji fallbacks, and produces a valid role field when only the everyone role exists.

The existing unique guild constraint on `ThreadChannels` and global member/account uniqueness on `GuildMembers` remain schema limitations. This checkpoint does not change those constraints or discard existing rows to bypass them. No live Discord or production-database verification is required by the offline checks.
