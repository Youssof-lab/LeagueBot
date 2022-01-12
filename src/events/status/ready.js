const Event = require("../Event");

class ReadyEvent extends Event {
  constructor(...args) {
    super(...args, {
      name: "ready",
      description: "Emitted when the client is ready to start working.",
      once: true,
    });
  }

  async run(bot) {
    const guild = bot.guilds.cache.get(bot.config.guildID);

    // Cache all available members
    this.cacheMembers(guild);

    process.on("unhandledRejection", (reason) => this.logger.error(reason));

    this.logger.info(`${bot.user.username} is now Online!`);
  }

  async cacheMembers(guild) {
    guild.members
      .fetch()
      .then(this.logger.info("Cached all possible members."))
      .catch((err) => this.logger.error(err));
  }
}

module.exports = new ReadyEvent();
