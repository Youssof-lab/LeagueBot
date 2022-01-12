/* eslint-disable global-require */
require("dotenv").config();

const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { clientID, guildID } = require("../config.json");
const logger = require("../util/Logger");

function registerSlashCommands(slashCommands) {
  const validSlashCommands = [];

  const modules = fs
    .readdirSync(`${__dirname}/`, { withFileTypes: true })
    .filter((file) => file.isDirectory())
    .map((file) => file.name);

  modules.forEach((module) => {
    const path = `${__dirname}/${module}`;
    const cmdFiles = fs.readdirSync(path).filter((file) => file.endsWith(".js"));
    cmdFiles.forEach((file) => {
      const cmd = require(`${__dirname}/${module}/${file}`);
      const slashCmd = cmd.buildSlashCommand();
      if (cmd.enabled && slashCmd) {
        slashCommands.set(cmd.name, slashCmd);
        validSlashCommands.push(slashCmd.data.toJSON());
      }
    });
  });

  // Register the slash commands at the guild level
  if (validSlashCommands.length > 0) {
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

    (async () => {
      try {
        await rest.put(Routes.applicationGuildCommands(clientID, guildID), {
          body: validSlashCommands,
        });
      } catch (err) {
        logger.error(err);
      }
    })();

    logger.info(
      `Registered ${validSlashCommands.length} ${
        validSlashCommands.length === 1 ? "slash command" : "slash commands"
      }`,
    );
  }
}
module.exports = {
  registerSlashCommands,
};
