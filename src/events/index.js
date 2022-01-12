/* eslint-disable global-require */
const fs = require("fs");
const logger = require("../util/Logger");

function setup(bot) {
  fs.readdirSync(`${__dirname}/`).forEach((module) => {
    const path = `${__dirname}/${module}`;

    // Set up events in directories/modules
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
      setupEvents(module);
    }
  });

  function setupEvents(module) {
    fs.readdir(`${__dirname}/${module}/`, (err, files) => {
      if (err) {
        logger.error(err);
        return;
      }

      const eventFiles = files.filter((f) => f.split(".").pop() === "js");

      if (eventFiles.length <= 0) {
        logger.warn(`No events found in ${module.toUpperCase()}`);
        return;
      }

      eventFiles.forEach((file) => {
        const event = require(`${__dirname}/${module}/${file}`);
        if (event.once) {
          bot.once(event.name, (...args) => event.run(...args, bot));
        } else {
          bot.on(event.name, (...args) => event.run(...args, bot));
        }
      });

      logger.info(
        `Started up ${files.length} ${files.length === 1 ? "event" : "events"} in ${module.toUpperCase()}`,
      );
    });
  }
}

module.exports = {
  setup,
};
