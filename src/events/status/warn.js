const Event = require("../Event");

class WarnEvent extends Event {
  constructor(...args) {
    super(...args, {
      name: "warn",
      description: "Emitted for general warnings.",
    });
  }

  run(info, bot) {
    this.logger.warn(info);
  }
}

module.exports = new WarnEvent();
