const Database = require('better-sqlite3');
const db = new Database('./data.sqlite');

function init() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS flights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      flight_number TEXT UNIQUE,
      origin TEXT,
      destination TEXT,
      depart_time TEXT,
      capacity INTEGER,
      description TEXT,
      announced INTEGER DEFAULT 0
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      username TEXT,
      flight_id INTEGER,
      experience TEXT,
      status TEXT DEFAULT 'PENDING',
      reviewer_id TEXT,
      reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(flight_id) REFERENCES flights(id)
    )
  `).run();
}

module.exports = {
  db,
  init
};
