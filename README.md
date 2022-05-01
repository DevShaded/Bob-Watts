<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://cdn.discordapp.com/avatars/661979662997782541/8d24d8bb9bb44411a8d08a798050c481.webp?size=128" alt="Bob Watts Logo"></a></p>

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

## Requirements for hosting own use of Bot
```
- MySQL Server
- Node v16x or above
- PM2 5x or adove
```

## Setup for hosting the bot
If you have all the requirements for hosting the bot, please follow the next step carefully!

1. Clone this repository to your local computer, or to your VPS
```
git clone https://github.com/DevShaded/BobWatts.git
```
4. Download the NPM dependencies with
```
npm install
```
5. Copy the contents of the `.env-example` file and make a new file called `.env` and paste the contents from the `.env-example` into to the `.env`
    * You have to fill out every environment variable's in the `.env` file to make the bot work properly
6. Create a new database in your MySQL server with a collation of `utf8mb4_unicode_ci`
7. Run the `npm run migrate` command to create the tables in your database
8. Once you have done every step above, you can start the bot with the PM2 command `pm2 start ecosystem.config.js` file
    * To check for any error's made from the bot run "pm2 logs Bob-Watts"
9. If you have no error's you should be done!

### First Time Usage
**COMING SOON**

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
| **/clearinfractions** |                                                                         |                                  |                              |
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
| Name     | Description                                 | Options                     | Level or Permission          |
|----------|---------------------------------------------|-----------------------------|------------------------------|
| **/add** | This command is to set pre-defined settings | < target >                  | **1** or **ADMINISTRATOR**   |
| **/set** | This command is to set pre-defined settings | < channel > **or** < role > | **1** or **ADMINISTRATOR**   |

## Contributions to this repository
- Fork this GitHub Repository
- Make changes to the bot
- Make to pull request to this repository with your code
- Done
