<p align="center"><img src="https://cdn.discordapp.com/avatars/661979662997782541/8d24d8bb9bb44411a8d08a798050c481.webp?size=128" alt="Bob Watts Logo"></p>

<h1 align="center">Bob Watts</h1>
<h3 align="center">The open-source multipurpose Discord Bot</h3>

<p align="center">
<span>This bot is being developed by <a href="https://github.com/DevShaded">DevShaded</a></span>
</p>


<p align="center">
<a href="https://devshaded.com/bobwatts">Add me to your server now!</a>
</p>

## About Bob Watts
Bob Watts is a multipurpose bot that does many things, from Fun and Informative commands to Moderation and Logging commands!
Bob Watts can be customized with many things like, custom Welcome/Goodbye messages, and moderation logging etc.

<p>
<span style="color:red">This bot
requires <span style="color:white; text-decoration: underline; text-decoration-color: white;">Administrator</span>
privileges in order to work properly</span>.
</p>

## Privacy and Data storage

By using Bob Watts services you agree that we store certain data in our database. When using our services, you agree that you have permission from your server members that we store the following data;

- Discord display name;
- Discord user ID;
- Guilds like: **Roles, Server Members**, etc.;
- Messages **FOR ONLY MODERATION ONLY**;
- Moderation's* like: **Admins, Moderators, Kicks, Bans, Warns and Mutes**;

## Local development setup

Requirements: Node.js 24, npm, and Docker with Docker Compose. The bot runs on
Node.js; MySQL runs in Docker. No separate MySQL installation is needed.

From the repository directory:

```bash
# If you use nvm:
nvm install
nvm use

npm ci
# On the first setup only; keep an existing .env file:
cp -n .env.example .env
chmod 600 .env
npm run db:up
npm run db:setup
npm run build
npm run check
```

`db:up` waits for MySQL to become healthy. `db:setup` applies the checked-in
migrations and generates Prisma Client. `check` validates the Prisma schema,
validates the shared slash command and event registries, and queries every database model.
It works before Discord credentials are added and does not contact Discord.
These checks do not exercise command execution against a live Discord server.

The bot uses Discord.js 14.27, Prisma 7.10, Axios 1.20, dotenv 18, Moment 2.31,
and optional PM2 7. Prisma CLI, Client, and the MariaDB adapter are pinned to
the same stable release; Prisma 8 is currently a release candidate.

The [Discord.js v14 migration](https://discordjs-guide.netlify.app/additional-info/changes-in-v14)
uses API v10, current builders, numeric permissions and gateway intents, and
API-compatible embed payloads. Stored guild and channel enum strings retain
their previous format, so existing data does not need conversion.

The [Prisma 7 migration](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)
moves the CLI connection URL to `prisma.config.ts` and uses one shared MariaDB
adapter for the bot's MySQL connection pool. The existing Prisma client generator is
retained and consumed from TypeScript ES modules. `npm ci` generates the client automatically,
even before `.env` exists. The database tables and migration history are unchanged.
For hosted connections, review the MariaDB driver's connection options: Prisma 6
URL options such as `connection_limit` are now driver options such as `connectionLimit`.

### Upgrade verification

```bash
npm test                 # Offline compatibility tests; no Discord or database calls
npm run check            # Validate commands, events, schema, and database queries
npm audit --omit=dev     # Audit runtime dependencies
npm audit               # Include development tools such as PM2
```

Tests exercise command payloads, permissions, ban history deletion, stored enum
values, startup, and command registration with mocked network/database calls.
Live command execution still needs a test Discord server.

### TypeScript development and verification

All maintained application code, scripts, tests, Prisma configuration, and ESLint
configuration are strict TypeScript. Node.js 24 runs emitted ES modules in
`dist/`; generated files never overwrite maintained sources. PM2 uses the
data-only `ecosystem.config.json`.

```bash
npm run typecheck       # All maintained sources, configs, and tests
npm run lint            # Type-aware lint; unsafe escapes and suppressions prohibited
npm run build           # Compile production application and scripts to dist/
npm run smoke           # Offline production Node/PM2 and runtime-resource checks
npm test                # Compile and run TypeScript offline tests
npm run verify          # Complete gate, in that order
npm run dev             # Build, start, and watch emitted modules under Node 24
npm run build:watch     # In a second terminal: recompile when TypeScript changes
```

For a clean production verification, remove generated `dist/` before building.
CI starts without `dist/` or `.env`, installs dependencies, generates Prisma
Client, typechecks, lints, builds, and runs the production smoke checks **before
compiling tests**. The smoke harness runs directly under Node 24 against compiled
production modules, from an unrelated working directory. Node and PM2 launches
replace only external Discord SDK operations, using an isolated temporary PM2
home; no Discord login, registration request, or database connection occurs.
The setup tests use a narrow controlled database collaborator.

`dist/src/application.mjs` exports callable `startBot(options)` and
`registerCommands(options)`. `dist/src/setup.mjs` exports `checkSetup(options)`.
Importing the application or CLI modules does not read `.env`, initialize a
database, log in, or register commands. Executing a CLI explicitly loads `.env`
and invokes its operation; failures exit with status 1. Production database
clients open lazily, are shared across consumers, and disconnect when their
owning gateway shuts down. Setup closes its client on success or failure.

`src/registry.mts` contains all 30 commands: Fun (8), Information (3),
Moderation (10), Public (5), Settings (4). Startup, registration, setup checks,
and help use these shared definitions. Adding a command requires an explicit
registry entry. Names come from slash definitions. Help sorts names within
Fun, Moderation, Public, Settings, Information and keeps every command visible
regardless of permissions or optional weather configuration. Tests verify exact
names, categories, serialized registration payloads, and help output.

The Discord adapter narrows incoming interactions and guild resources; event
contracts enforce event arguments and one-time readiness versus repeated events.
Offline tests use narrow gateway, REST, HTTP, and database interfaces rather than
incomplete library objects or import-cache manipulation. Established payload,
permission, ban-history, stored-enum, startup, and registration assertions remain
covered at these application boundaries. The [migration record](docs/typescript-migration.md)
documents preserved behavior and corrected defects.

Bot information imports package metadata as JSON. The production compiler copies
it to `dist/package.json`; smoke checks verify version lookup and help outside
the repository working directory before test output exists.

Configuration is validated by the operation that consumes it:

| Operation | Required configuration |
| --- | --- |
| Startup | `APP_ENV`, `APP_TOKEN`, `DATABASE_URL` |
| Registration | `APP_ENV`, `APP_TOKEN`, `APP_CLIENT_ID`; `APP_GUILD_ID` in development |
| Setup checks | `DATABASE_URL`; missing Discord settings are reported without authentication |
| Imports, dependency installation, Prisma generation | No environment file or credentials |

`APP_ENV` accepts `development` or `production`. Startup logging guild/channel
IDs and weather credentials remain optional. `/weather` returns a private
unavailable response when its integration is unconfigured. Production registration
uses the global application route; development uses the configured guild, both
through Discord API v10. Setup queries all 14 models to check database/schema
compatibility; it does not authenticate Discord credentials. The database schema,
historical enum strings, and existing migrations are unchanged.

ESLint loads `eslint.config.mts` using its native Node TypeScript configuration
flag; Prisma loads `prisma.config.ts` directly. Both configs participate in strict
typechecking and linting. No handwritten JavaScript configuration remains.

As of October 14, 2026, the runtime dependency audit reports zero vulnerabilities.
The full audit reports three high findings along the optional PM2 dependency
chain `pm2 > chokidar > braces`, caused by the same
[unpatched braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
Targeted overrides select patched MariaDB, MySQL2, deepmerge-ts, basic-ftp, and
js-yaml versions while their parent packages still select vulnerable releases.
Review those overrides when updating their parent packages. Avoid `npm audit fix
--force`, which currently proposes downgrading major packages.

### Docker database

The [MySQL image](https://hub.docker.com/_/mysql) runs on `127.0.0.1:3307` using
database `bobwattsv3`. The development credentials in `.env.example` match
`compose.yaml`. If port 3307 is occupied, change both `MYSQL_PORT` and the port
in `DATABASE_URL` in `.env`. These credentials are for local development only.

```bash
npm run db:up             # Start MySQL and wait for readiness
docker compose ps        # Show database status
docker compose logs mysql
npm run db:down           # Stop/remove the container; retain database data
```

Data persists in Docker's `mysql-data` volume between container restarts.
`docker compose down -v` deletes that data. Changing `MYSQL_ROOT_PASSWORD` in
`.env` does not change the password inside an already initialized volume.

For later schema changes, use `npm run migrate` and commit the generated
`prisma/migrations` files. Run `npm run db:setup` to apply existing migrations.
The initial migration is for a new database; an existing installation needs
[baselining](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining)
before using this migration history.

### Discord configuration

Use a test bot and server for development. Fill these values in the ignored
`.env` file:

| Variable | Value |
| --- | --- |
| `APP_ENV` | Keep `development` to register commands only in the test server. |
| `APP_TOKEN` | Bot token from the application's **Bot** page in the [Developer Portal](https://discord.com/developers/applications). |
| `APP_CLIENT_ID` | Application ID from **General Information**. |
| `APP_GUILD_ID` | Test server ID; also used for the bot's operational logs. |
| `APP_CHANNEL_ID` | Text channel ID in that server for join/leave/update logs. |
| `APP_WEATHER_API` | Optional OpenWeather API key, needed only by `/weather`. |

Enable **Server Members Intent**, **Presence Intent**, and **Message Content
Intent** on the application's Bot page. Message content is used by the existing
message logging and `!help` handler. The client requests these
[privileged intents](https://docs.discord.com/developers/events/gateway#privileged-intents).
In Discord, enable **Developer Mode** under **User Settings > Advanced** to copy
server and channel IDs.

To invite the bot, open the application's **Installation** page, enable
**Guild Install**, and select **Discord Provided Link** under **Install Link**.
Under **Default Install Settings > Guild Install**, select the `bot` and
`applications.commands` scopes. The bot expects Administrator for its
full moderation feature set; use a dedicated test server. Copy the install link,
open it, choose **Add to server**, and select your test server. You need
**Manage Server** permission to install it there. See Discord's
[installation guide](https://docs.discord.com/developers/quick-start/getting-started#adding-scopes-and-bot-permissions).

In **Server Settings > Roles**, place the bot's role above roles and members it
must manage. Administrator does not bypass Discord's
[role hierarchy](https://docs.discord.com/developers/topics/permissions#permission-hierarchy).

Register the slash commands, then start the bot:

```bash
npm run build
npm run register
npm start
```

Use `/ping` in the test server to check a live response. `npm run dev` starts
Node's watch mode on compiled output. In a second terminal, run `npm run build:watch`
to compile TypeScript changes and trigger restarts. Stop either foreground process with Ctrl+C.
Changing `APP_ENV` to `production` makes `npm run register` replace the
application's global command list.

Direct production launches use the same compiled CLI:

```bash
node dist/scripts/start.mjs
node dist/scripts/register.mjs
node dist/scripts/check-setup.mjs
```

Run from the repository directory so CLI `.env` loading and PM2 relative paths
resolve to your installation. Rebuild after changing maintained sources.
`/botinfo` reads the package version and running process uptime.
PM2 is optional. To use it, stop the foreground bot first:

```bash
npm run build
npx pm2 start ecosystem.config.json
npx pm2 logs "Bob Watts"
npx pm2 stop "Bob Watts"
```

PM2 file watching is disabled so Git fetches and generated files cannot restart
the running bot. Use `npm run dev` for intentional development watching. To disable
watching for an existing PM2 process, run `npx pm2 stop "Bob Watts" --watch`, then
`npx pm2 restart "Bob Watts"`. Editing the ecosystem file alone does not change the
daemon's saved settings.
`/ping` reports unavailable gateway latency until Discord has supplied a valid
heartbeat measurement, rather than displaying the initial `-1` value as a latency.

## Commands

### Fun Commands
| Name          | Description                                            | Options     |
|---------------|--------------------------------------------------------|-------------|
| **/8ball**    | Ask a question and get an answer from the magic 8 ball | < message > |
| **/coinflip** | Flips a coin and return either Heads or Tails          | NONE        |
| **/cookie**   | Returns a fortune cookie message                       | NONE        |
| **/diceroll** | Dice roll, returns a number between 1 and 6            | NONE        |
| **/hug**      | Hug the mentioned user                                 | < user >    |
| **/kiss**     | Kiss the mentioned user                                | < user >    |
| **/rps**      | Rock, Paper, Scissors                                  | < tool >    |
| **/slap**     | Slap the mentioned user                                | < user >    |

### Information Commands
| Name         | Description                                     | Options                 |
|--------------|-------------------------------------------------|-------------------------|
| **/weather** | Get the current weather forecast for a location | < location >  < units > |

### Moderation Commands
| Name                  | Description                                                             | Options                          | Level or Permission          |
|-----------------------|-------------------------------------------------------------------------|----------------------------------|------------------------------|
| **/ban**              | Ban the mentioned user from a server                                    | < target > [ reason ]            | **2** or **BAN_MEMBERS**     |
| **/clean**            | Clear a certain amount of infractions of the mentioned user in a server | < target > < amount > [ reason ] | **1** or **MANAGE_MESSAGES** |
| **/clearinfractions** | Clear a certain amount of infractions of the mentioned user in a server | < target > < amount > [ reason ] | **1** or **ADMINISTRATOR**   |
| **/kick**             | Kick the mentioned user from a server                                   | < target > [ reason ]            | **2** or **KICK_MEMBERS**    |
| **/mute**             | Mute the mentioned user in your server                                  | < target > [ days ] [ reason ]   | **2** or **MANAGE_MESSAGES** |
| **/unban**            | Unban the mentioned user from a server                                  | < target >                       | **2** or **BAN_MEMBERS**     |
| **/unmute**           | Unmute the mentioned user in your server                                | < target > [ reason ]            | **2** or **MANAGE_MESSAGES** |
| **/warn**             | Warn the mentioned user in a server                                     | < target > [ reason ]            | **3** or **MANAGE_MESSAGES** |

### Public Commands
| Name            | Description                                                       | Options  |
|-----------------|-------------------------------------------------------------------|----------|
| **/botinfo**    | Display information of the client/bot itself                      | NONE     |
| **/help**       | Returns a message with all of the commands available from the bot | NONE     |
| **/ping**       | Returns a message with a response time message                    | NONE     |
| **/serverinfo** | Returns a message with server information                         | NONE     |
| **/userinfo**   | Display information about the mentioned user in a server          | < user > |



### Settings Commands
| Name        | Description                                 | Options                     | Level or Permission          |
|-------------|---------------------------------------------|-----------------------------|------------------------------|
| **/add**    | This command is to set pre-defined settings | < target >                  | **1** or **ADMINISTRATOR**   |
| **/delete** | This command is to set pre-defined settings | < target >                  | **1** or **ADMINISTRATOR**   |
| **/remove** | This command is to set pre-defined settings | NONE                        | **1** or **ADMINISTRATOR**   |
| **/set**    | This command is to set pre-defined settings | < channel > **or** < role > | **1** or **ADMINISTRATOR**   |

## Contributions to this repository
- Fork this GitHub Repository
- Make changes to the bot
- Make to pull request to this repository with your code
- Done
