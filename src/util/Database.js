const Database = require("better-sqlite3");

const db = new Database("league.db");

function setup() {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS accounts (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      username        TEXT NOT NULL UNIQUE,
      encryptedID     TEXT NOT NULL UNIQUE,
      puuid           TEXT NOT NULL UNIQUE
    );`,
  ).run();
  db.prepare(
    `CREATE TABLE IF NOT EXISTS matches (
      matchID            TEXT NOT NULL,
      puuid              TEXT NOT NULL,
      gameCreation       INTEGER DEFAULT 0,
      gameDuration       INTEGER DEFAULT 0,
      win                BOOLEAN DEFAULT 0,
      champion           TEXT NOT NULL,
      champLevel         INTEGER DEFAULT 1,
      goldEarned         INTEGER DEFAULT 500,
      kills              INTEGER DEFAULT 0,
      teamKills          INTEGER DEFAULT 0,
      deaths             INTEGER DEFAULT 0,
      assists            INTEGER DEFAULT 0,
      turretKills        INTEGER DEFAULT 0,
      baronKills         INTEGER DEFAULT 0,
      dragonKills        INTEGER DEFAULT 0,
      inhibitorKills     INTEGER DEFAULT 0,
      firstBloodKill     BOOLEAN DEFAULT 0,
      firstTowerKill     BOOLEAN DEFAULT 0,
      largestMultiKill   INTEGER DEFAULT 0,
      damageDealt        INTEGER DEFAULT 0,
      Qcasts             INTEGER DEFAULT 0,
      Wcasts             INTEGER DEFAULT 0,
      Ecasts             INTEGER DEFAULT 0,
      Rcasts             INTEGER DEFAULT 0,
      PRIMARY KEY (matchID, puuid)
    );`,
  ).run();
}

function get(query, ...args) {
  return db.prepare(query).all(...args);
}

function insert(query, ...args) {
  db.prepare(query).run(...args);
}

function update(query, ...args) {
  db.prepare(query).run(...args);
}

module.exports = {
  setup,
  get,
  insert,
  update,
};
