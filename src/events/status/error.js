const Event = require("../Event");

class ErrorEvent extends Event {
  constructor(...args) {
    super(...args, {
      name: "error",
      description: "Emitted when the client encounters an error.",
    });
  }

  run(err, bot) {
    this.logger.error(err);
  }
}

module.exports = new ErrorEvent();
