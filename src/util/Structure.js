const { Permissions } = require("discord.js");
const responses = require("../res/responses");
const Logger = require("./Logger");
const helper = require("./Helper");

/**
 * Base class for all Structures
 * @class
 */
class Structure {
  constructor() {
    this.responses = responses;
    this.logger = Logger;
    this.helper = helper;
    this.perms = Permissions.FLAGS;
  }
}

module.exports = Structure;
