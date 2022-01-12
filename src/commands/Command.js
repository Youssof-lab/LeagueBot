const { SlashCommandBuilder } = require("@discordjs/builders");
const Structure = require("../util/Structure");

/**
 * Base class for all commands.
 * @class
 */
class Command extends Structure {
  /**
   *
   * @typedef {Object} Options
   * @property {String} name The name used as a trigger for the command.
   * @property {String} description The command description.
   * @property {String} module The module to which the command belongs to.
   * @property {String[]} [permissions=[]] The required permissions to run this command.
   * @property {Boolean} [enabled=true] Whether the command is enabled.
   * @property {Object} SlashCommandBuilder The DiscordJS slash command build utility.
   */

  /**
   * @constructs Command
   * @param {Options} options The options used to handle how to handle the command.
   */
  constructor(options) {
    super();
    this.name = options.name;
    this.description = options.description;
    this.module = options.module;
    this.permissions = options.permissions || [];
    this.enabled = "enabled" in options ? options.enabled : true;
    this.SlashCommandBuilder = SlashCommandBuilder;
  }

  /**
   * @abstract
   * The default run function. Executed when a slash command is used.
   */
  async run() {
    // Defined by extension commands individually
  }

  /**
   * @abstract
   * Function used to define the slash command structure.
   */
  buildSlashCommand() {
    // Defined by extension commands individually
    return false;
  }
}

module.exports = Command;
