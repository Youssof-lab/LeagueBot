const { Permissions } = require("discord.js");
const responses = require("../res/responses");
const Logger = require("./Logger");

/**
 * Base class for all Structures
 * @class
 */
class Structure {
  constructor() {
    this.responses = responses;
    this.logger = Logger;
    this.perms = Permissions.FLAGS;
  }
}

module.exports = Structure;
