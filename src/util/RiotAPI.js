const axios = require("axios");
const db = require("./Database");
const logger = require("./Logger");

class RiotAPI {
  // https://static.developer.riotgames.com/docs/lol/queues.json
  queueIDs = {
    ranked: "420",
    flex: "440",
  };

  // https://developer.riotgames.com/docs/lol
  routes = {
    platform: "https://na1.api.riotgames.com",
    region: "https://americas.api.riotgames.com",
  };

  // https://developer.riotgames.com/apis
  paths = {
    summoner: "/lol/summoner/v4/summoners/by-name/",
    matchHistory: "/lol/match/v5/matches/by-puuid/{puuid}/ids",
    matchSpecific: "/lol/match/v5/matches/{matchId}",
  };

  /**
   * Initialize the RiotAPI object for a specific summoner.
   * @param {string} username The username to look up.
   */
  async init(username) {
    this.username = username;

    // Check if the username exists in the database first
    const result = db.get("SELECT * FROM accounts WHERE username = ?", this.username);

    if (result.length > 0) {
      this.summoner = {
        username: result[0].username,
        encryptedID: result[0].encryptedID,
        puuid: result[0].puuid,
        fetchedFrom: "DATABASE",
      };
    } else {
      try {
        // GET the current username's information
        const response = await axios.get(`${this.routes.platform + this.paths.summoner + this.username}`, {
          params: {
            api_key: process.env.RIOT_API_KEY,
          },
        });

        this.summoner = {
          username: response.data.name,
          encryptedID: response.data.id,
          puuid: response.data.puuid,
          fetchedFrom: "API",
        };

        db.insert(
          "INSERT OR IGNORE INTO accounts (username, encryptedID, puuid) VALUES (?, ?, ?)",
          this.summoner.username,
          this.summoner.encryptedID,
          this.summoner.puuid,
        );
      } catch (e) {
        logger.error(e);
        if (e.response.status === 404) {
          throw Error(`The username **${this.username}** was not found.`);
        } else if (e.response.status === 429) {
          // TODO: Add proper handling for rate limits
          throw Error("Rate Limit Reached.");
        } else {
          throw Error("An error occured while trying to process your request.");
        }
      }
    }
  }

  /**
   * Fetch and parse the specific details of the current summoner's match history.
   * @param {number} count The desired number of match id's to return.
   * @param {string} queueType The desired queue type to filter by.
   * @returns A list of parsed matches.
   */
  async getMatchHistory(count, queueType) {
    const matches = [];
    const placeholders = "?,".repeat(24).slice(0, -1);

    try {
      // Get the list of match history id's then divide them into found and missing id's
      const games = await this.getMatchHistoryIDs(count, queueType);
      const cachedGames = this.searchDatabaseForMatches(games);

      if (cachedGames.found.length === 0 && cachedGames.missing.length === 0) {
        return matches;
      }

      // If there were found games in the database, push the relevant values
      if (cachedGames.found.length > 0) {
        for (const foundGame of cachedGames.found) {
          matches.push({
            win: foundGame.win,
            championName: foundGame.champion,
            kills: foundGame.kills,
            deaths: foundGame.deaths,
            assists: foundGame.assists,
            champLevel: foundGame.champLevel,
            gameCreation: foundGame.gameCreation,
          });
        }
      }

      // If there are missing games from the database, fetch those games,
      // add them to the database, and push relevant values
      if (cachedGames.missing.length > 0) {
        for (const gameID of cachedGames.missing) {
          const matchIDPath = this.paths.matchSpecific.replace("{matchId}", gameID);

          const response = await axios.get(`${this.routes.region + matchIDPath}`, {
            params: {
              api_key: process.env.RIOT_API_KEY,
            },
          });

          const gameInfo = response.data.info;

          // Loop through the players to find the current summoner in the fetched game
          for (const player of gameInfo.participants) {
            if (player.puuid === this.summoner.puuid) {
              let teamTotalKills = 0;

              matches.push({
                win: player.win,
                championName: player.championName,
                kills: player.kills,
                deaths: player.deaths,
                assists: player.assists,
                champLevel: player.champLevel,
                gameCreation: gameInfo.gameCreation,
              });

              // Find the summoner's team
              for (const team of gameInfo.teams) {
                teamTotalKills = team.teamId === player.teamId ? team.objectives.champion.kills : 0;
              }

              db.insert(
                `INSERT INTO matches VALUES (${placeholders})`,
                gameID,
                this.summoner.puuid,
                gameInfo.gameCreation,
                gameInfo.gameDuration,
                player.win ? 1 : 0,
                player.championName,
                player.champLevel,
                player.goldEarned,
                player.kills,
                teamTotalKills,
                player.deaths,
                player.assists,
                player.turretKills,
                player.baronKills,
                player.dragonKills,
                player.inhibitorKills,
                player.firstBloodKill ? 1 : 0,
                player.firstTowerKill ? 1 : 0,
                player.largestMultiKill,
                player.totalDamageDealtToChampions,
                player.spell1Casts,
                player.spell2Casts,
                player.spell3Casts,
                player.spell4Casts,
              );
            }
          }
        }
      }
    } catch (e) {
      logger.error(e);
      if (e.response.status === 429) {
        // TODO: Add proper handling for rate limits
        throw Error("Rate Limit Reached.");
      } else {
        throw Error("An error occured while trying to process your request.");
      }
    }

    return matches;
  }

  /**
   * Search for the specified list of game id's in the database.
   * @param {Array} gameIDs A list of game id's to look up.
   * @returns An object containing lists of found and missing game id's.
   */
  searchDatabaseForMatches(gameIDs) {
    const placeholders = gameIDs.map(() => "?").join(",");

    const cached = db.get(
      `SELECT * FROM matches WHERE matchID IN (${placeholders}) AND puuid = ?;`,
      gameIDs,
      this.summoner.puuid,
    );

    const foundGames = cached.map((game) => {
      return game.matchID;
    });

    const results = {
      found: cached,
      missing: gameIDs.filter((g) => !foundGames.includes(g)),
    };

    return results;
  }

  /**
   * Fetch a set number of matches from the current summoner's match history.
   * @param {number} count The desired number of match id's to return.
   * @param {string} queueType The desired queue type to filter by.
   * @returns A list of match id's.
   */
  async getMatchHistoryIDs(count, queueType) {
    const matchHistoryPath = this.paths.matchHistory.replace("{puuid}", this.summoner.puuid);

    try {
      const response = await axios.get(`${this.routes.region + matchHistoryPath}`, {
        params: {
          queue: this.queueIDs[queueType],
          type: ["ranked", "flex"].includes(queueType) ? "ranked" : "normal",
          start: 0,
          count,
          api_key: process.env.RIOT_API_KEY,
        },
      });

      return response.data;
    } catch (e) {
      throw e;
    }
  }
}

module.exports = RiotAPI;
