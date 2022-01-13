const Event = require("../Event");

class InteractionCreateEvent extends Event {
  constructor(...args) {
    super(...args, {
      name: "interactionCreate",
      description: "Emitted when an interaction is created.",
    });
  }

  async run(interaction, bot) {
    if (interaction.isCommand()) {
      // Get the requested slash command
      const command = bot.slashCommands.get(interaction.commandName);

      if (!command) return;

      try {
        // Run the requested slash command
        await command.execute(bot, interaction);
      } catch (err) {
        // Log any errors and show a message reply visible only to the user
        this.logger.error(err);
        interaction.reply({
          content: this.responses.ERR_INTER_SOMETHING_WENT_WRONG,
          ephemeral: true,
        });
      }
    }
  }
}

module.exports = new InteractionCreateEvent();
