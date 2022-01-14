const axios = require("axios");

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

  async init(username) {
    this.username = username;

    try {
      const response = await axios.get(`${this.routes.platform + this.paths.summoner + this.username}`, {
        params: {
          api_key: process.env.RIOT_API_KEY,
        },
      });

      this.summoner = {
        username: response.data.name,
        encryptedID: response.data.id,
        puuid: response.data.puuid,
        iconID: response.data.profileIconId,
        level: response.data.summonerLevel,
      };
    } catch (e) {
      throw Error(`Summoner could not be fetched. ${e.message}`);
    }
  }

  // Parse match history data and return the parsed out fields
  async getMatchHistory(count, queueType) {
    const matches = [];

    try {
      const games = await this.getMatchHistoryIDs(count, queueType);

      // Loop through each game ID
      for (const game of games) {
        const matchIDPath = this.paths.matchSpecific.replace("{matchId}", game);

        // Fetch each game and find relevant data for the current summoner.
        const response = await axios.get(`${this.routes.region + matchIDPath}`, {
          params: {
            api_key: process.env.RIOT_API_KEY,
          },
        });

        for (const player of response.data.info.participants) {
          if (player.puuid === this.summoner.puuid) {
            matches.push({
              win: player.win,
              championName: player.championName,
              kills: player.kills,
              deaths: player.deaths,
              assists: player.assists,
              champLevel: player.champLevel,
            });
          }
        }
      }
    } catch (e) {
      throw Error(`Summoner could not be fetched. ${e.message}`);
    }

    return matches;
  }

  // Return an array of match history ID's
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
