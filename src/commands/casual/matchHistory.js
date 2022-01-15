const { MessageEmbed } = require("discord.js");
const table = require("text-table");
const wait = require("util").promisify(setTimeout);
const Command = require("../Command");
const RiotAPI = require("../../util/RiotAPI");
const helper = require("../../util/Helper");

class MatchHistoryCommand extends Command {
  constructor(...args) {
    super(...args, {
      name: "history",
      description: "Display the last 10 games for the given username.",
      module: "Casual",
    });
  }

  buildSlashCommand() {
    const runSlash = this.run;

    return {
      data: new this.SlashCommandBuilder()
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((option) =>
          option.setName("username").setDescription("The username to look for.").setRequired(true),
        ),
      async execute(bot, interaction) {
        await runSlash(bot, interaction);
      },
    };
  }

  async run(bot, interaction) {
    await interaction.deferReply({ ephemeral: true });

    const startTime = performance.now();
    const userInput = interaction.options.getString("username");
    const historyEmbed = new MessageEmbed();
    const riot = new RiotAPI();
    let embedBody = [];

    wait(1000);

    try {
      await riot.init(userInput);

      await riot.getMatchHistory(10, "ranked");

      // Get the last 10 matches
      const matchHistory = await riot.getMatchHistory(10, "ranked");

      if (matchHistory.length > 0) {
        // Sort by game creation timestamp
        matchHistory.sort((a, b) => b.gameCreation - a.gameCreation);

        matchHistory.forEach((match) => {
          let kda = ((match.kills + match.assists) / match.deaths).toFixed(2);
          if (match.deaths === 0) kda = "⭐";

          embedBody.push([
            match.win ? "✅" : "❌",
            `${match.championName}`,
            `${match.kills} / ${match.deaths} / ${match.assists}`,
            `Lvl ${match.champLevel}`,
            `KDA ${kda}`,
          ]);
        });
        embedBody = helper.codeBlock("css", table(embedBody));
        historyEmbed.setColor("YELLOW").setTitle(`${riot.username}'s Last 10 Games`);
      } else {
        embedBody = "No games found in match history or something went wrong while trying to fetch them.";
        historyEmbed.setColor("DARK_RED").setTitle(`❌ Error`);
      }
    } catch (e) {
      embedBody = e.message;
      historyEmbed.setColor("DARK_RED").setTitle(`❌ Error`);
    }

    const completeTime = ((performance.now() - startTime) / 1000).toFixed(2);
    historyEmbed.setDescription(`${embedBody}`).setFooter({ text: `Completed in ${completeTime}s.` });

    await interaction.editReply({ embeds: [historyEmbed] });
  }
}

module.exports = new MatchHistoryCommand();
