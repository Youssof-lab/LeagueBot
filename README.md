# LeagueBot
League of Legends Discord Bot.

## Install & Run

1. Clone the repository

```
git clone https://github.com/Youssof-lab/LeagueBot.git
```

2. Create a `.env` file in the project's root directory.

```
cd LeagueBot
touch .env
```

4. Install project dependencies.

```
npm install
```

5. In your new `.env` file, insert your [Discord bot token](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) as a string assigned to  `TOKEN`. Below is an example for how to format the token variable:

```
TOKEN="xxxxxxxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxxxxxxxxxxxx-xxxxxxxx"
```

6. Replace the ID variables for the Guild and Client in `config.json` to match your needs. 

7. Run the bot.

```
node .
```





