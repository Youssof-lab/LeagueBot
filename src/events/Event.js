const Structure = require("../util/Structure");

/**
 * Base class for all events.
 * @class
 */
class Event extends Structure {
  /**
   * @typedef {Object} Options
   * @property {String} name The name of the client event emitted.
   * @property {String} description The description of the event.
   * @property {Boolean} [once=false] Whether to listen for the event once.
   */

  /**
   * @constructs Event
   * @param {Options} options The options used to handle how to handle the event.
   */
  constructor(options) {
    super();
    this.name = options.name;
    this.description = options.description;
    this.once = options.once || false;
  }

  /**
   * @abstract
   */
  async run() {
    // Defined by extended events
  }
}

module.exports = Event;
