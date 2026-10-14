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
npm run check
```

`db:up` waits for MySQL to become healthy. `db:setup` applies the checked-in
migrations and generates Prisma Client. `check` validates the Prisma schema,
loads every slash command and event module, and queries every database model.
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
moves the CLI connection URL to `prisma.config.js` and uses one shared MariaDB
adapter for the bot's MySQL connection pool. The JavaScript client generator is
retained for this CommonJS codebase. `npm ci` generates the client automatically,
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

`index.js` exports `startBot()`, which resolves to the client after login.
`createapplicationcommands.js` exports `registerCommands(env = process.env)`,
which resolves after registration and rejects on configuration or API failures.
Importing either entrypoint does not load `.env`, log in, register commands, or
initialize the database. The CLI commands still load `.env` and call these
operations explicitly. Tests invoke them repeatedly with external services
stubbed, without clearing the CommonJS module cache.

### TypeScript migration checkpoint (#28)

The integration branch now also contains a strictly checked ESM path in `src/`.
It currently registers and dispatches **only `/ping`**. The full 30-command
CommonJS bot remains the operational entrypoint while tickets #29–33 migrate
the remaining behaviors. Ticket #34 owns the complete-project verification
gate and production cutover; this checkpoint is not a completed bot migration.

```bash
npm run typecheck:typed  # src/ and test/typed/ only
npm run lint:typed       # Type-aware lint for the same maintained TypeScript
npm run build:typed      # Compile src/*.mts to dist/src/*.mjs
npm run test:typed       # Compile and run the typed offline application tests
npm test                # Legacy regression suite plus the typed suite
```

The existing offline CI workflow also runs `lint:typed`. Compatibility fixtures
in `test/typed/fixtures/compatibility.mts` retain every historical database enum
string and the 18 moderator authorization outcomes checked during this checkpoint.
The typed suite replays those shared contracts; reuse the fixtures in application
tests when tickets #31–33 migrate their consumers.

Node 24 runs the emitted ES modules; generated files stay in ignored `dist/`.
The temporary `.mts`/`.mjs` boundary lets the legacy CommonJS files coexist
without changing their loader. Type checking includes tests, strict null and
indexed-access checks, and exact optional properties. Type-aware lint prohibits
unsafe assignments, assertions, suppression comments, and inline rule disabling.
These are scoped checks, not a claim that legacy JavaScript is type safe.

`dist/src/application.mjs` exports callable `startBot(options)` and
`registerCommands(options)`. Their default collaborators use Discord.js; the
offline tests supply narrow gateway and REST interfaces instead. **Do not use
this partial registry for live registration:** Discord replaces the command
list with its payload. Continue using the existing launch and registration
commands until the final integration ticket.

`src/registry.mts` explicitly composes commands and events. Commands carry
category metadata in the existing help order; registration and dispatch derive
names from the actual command definitions. Event contracts check argument
types and whether a subscription runs once or repeatedly. The Discord adapter
narrows incoming interactions before dispatch and reports asynchronous errors.

Configuration is read only when its owning operation runs:

| Operation | Required configuration |
| --- | --- |
| Typed startup | `APP_ENV`, `APP_TOKEN`, `DATABASE_URL`, `APP_GUILD_ID`, `APP_CHANNEL_ID` |
| Typed registration | `APP_ENV`, `APP_TOKEN`, `APP_CLIENT_ID`; `APP_GUILD_ID` in development |
| Setup configuration contract | `DATABASE_URL`; missing Discord settings are reported without authentication |
| Definition imports, dependency installation, Prisma generation | No environment file or credentials |

`APP_ENV` accepts `development` or `production`. Weather credentials remain
optional. The shared database factory creates a client only when called; its
owning operation must share that client and disconnect it when finished.
Typed database enum mappings retain the historical stored strings, and
moderator verification retains the level comparison (administrator 1,
moderator 2, soft moderator 3). Their existing consumers remain assigned to
the later migration tickets, including Discord permission checks and database
activity at startup. No schema migration is needed for this checkpoint.

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
`applications.commands` scopes. The legacy bot expects Administrator for its
full moderation feature set; use a dedicated test server. Copy the install link,
open it, choose **Add to server**, and select your test server. You need
**Manage Server** permission to install it there. See Discord's
[installation guide](https://docs.discord.com/developers/quick-start/getting-started#adding-scopes-and-bot-permissions).

In **Server Settings > Roles**, place the bot's role above roles and members it
must manage. Administrator does not bypass Discord's
[role hierarchy](https://docs.discord.com/developers/topics/permissions#permission-hierarchy).

Register the slash commands, then start the bot:

```bash
npm run register
npm start
```

Use `/ping` in the test server to check a live response. `npm run dev` starts
Node's watch mode for development. Stop either foreground process with Ctrl+C.
Changing `APP_ENV` to `production` makes `npm run register` replace the
application's global command list.

`/botinfo` reads version and uptime directly from the running Node process.
PM2 is optional. To use it, stop the foreground bot first:

```bash
npx pm2 start ecosystem.config.js
npx pm2 logs "Bob Watts"
npx pm2 stop "Bob Watts"
```

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
