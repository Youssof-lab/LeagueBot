const Command = require("../Command");

class EchoCommand extends Command {
  constructor(...args) {
    super(...args, {
      name: "echo",
      description: "Make the bot echo something back.",
      module: "Casual",
    });
  }

  buildSlashCommand() {
    const runSlash = this.run;

    return {
      // Set up one string argument
      data: new this.SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) => option.setName("input")
          .setDescription("The text input to echo.").setRequired(true),
        ),
      async execute(bot, interaction) {
        await runSlash(bot, interaction);
      },
    };
  }

  async run(bot, interaction) {
    // Fetch the value of the input argument and echo it back
    const userInput = interaction.options.getString("input");
    return interaction.reply({ content: `\`${interaction.member} said :\` ${userInput}` });
  }
}

module.exports = new EchoCommand();
