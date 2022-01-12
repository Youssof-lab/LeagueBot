require("dotenv").config();

const Discord = require("discord.js");
const config = require("./config.json");
const logger = require("./util/Logger");
const eventHandler = require("./events");
// const commandHandler = require("./commands");

class LeagueBot extends Discord.Client {
  constructor(clientOptions = {}) {
    super(clientOptions);

    this.discord = Discord;
    this.slashCommands = new this.discord.Collection();

    this.config = config;
  }

  async start() {
    logger.info("Starting...");
    eventHandler.setup(this);
    // commandHandler.registerSlashCommands(this.slashCommands);
    this.login(process.env.TOKEN).catch((err) => logger.error(err));
  }
}

const bot = new LeagueBot({
  allowedMentions: {
    parse: ["roles", "users"],
    repliedUser: false,
  },
  presence: {
    activities: [
      {
        name: `v${config.version}`,
        type: "PLAYING",
      },
    ],
  },
  intents: [
    "GUILDS",
    "GUILD_MEMBERS",
    "GUILD_PRESENCES",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
  ],
  partials: ["MESSAGE", "CHANNEL"],
});

bot.start();
