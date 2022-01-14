const { MessageEmbed, EmbedFooterData } = require("discord.js");
const table = require("text-table");
const wait = require("util").promisify(setTimeout);

const Command = require("../Command");
const RiotAPI = require("../../util/RiotAPI");
const testdata = require("../../res/test.json");

class TestCommand extends Command {
  constructor(...args) {
    super(...args, {
      name: "history",
      description: "Display the last 10 games.",
      module: "Casual",
    });
  }

  buildSlashCommand() {
    const runSlash = this.run;

    return {
      // Set up one string argument
      data: new this.SlashCommandBuilder().setName(this.name).setDescription(this.description),
      // .addStringOption((option) =>
      //   option
      //     .setName("gamemode")
      //     .setDescription("The gamemode to search for.")
      //     .setRequired(false)
      //     .addChoice("Ranked Solo/Duo", "ranked")
      //     .addChoice("Ranked Flex", "flex")
      //     .addChoice("ARAM", "aram"),
      // ),
      async execute(bot, interaction) {
        await runSlash(bot, interaction);
      },
    };
  }

  async run(bot, interaction) {
    await interaction.deferReply({ ephemeral: false });
    const startTime = performance.now();
    const queueInput = interaction.options.getString("gamemode");
    const riot = new RiotAPI();

    wait(1000);
    await riot.init("Youssof");

    // Get the last 10 matches
    const matchHistory = await riot.getMatchHistory(10, "ranked");
    let formattedHistory = [];

    if (matchHistory.status !== 200) {
      formattedHistory = matchHistory.data;
    } else {
      // Push all the relevant data we want into the array to be formatted
      if (matchHistory.data.length > 0) {
        matchHistory.data.forEach((match) => {
          const kda = (match.kills + match.assists) / match.deaths;
          formattedHistory.push([
            match.win ? "✅" : "❌",
            `${match.championName}`,
            `${match.kills} / ${match.deaths} / ${match.assists}`,
            `Lvl ${match.champLevel}`,
            `KDA ${kda.toFixed(2)}`,
          ]);
        });
      } else {
        formattedHistory.push();
      }
    }

    const completeTime = ((performance.now() - startTime) / 1000).toFixed(2);
    const historyEmbed = new MessageEmbed()
      .setTitle(`Youssof's Last 10 games`)
      .setColor("YELLOW")
      .setDescription("```css\n" + table(formattedHistory) + "```")
      .setFooter({ text: `Completed in ${completeTime}s.` });

    await interaction.editReply({ embeds: [historyEmbed], ephemeral: false });
  }
}

module.exports = new TestCommand();
