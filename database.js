// database.js
const Database = require('better-sqlite3');

const db = new Database('tp-microservices.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tvshows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL
  );
`);

// Seed some initial data if tables are empty
const movieCount = db.prepare('SELECT COUNT(*) as count FROM movies').get();
if (movieCount.count === 0) {
  db.prepare('INSERT INTO movies (title, description) VALUES (?, ?)').run('Example Movie 1', 'This is the first example movie.');
  db.prepare('INSERT INTO movies (title, description) VALUES (?, ?)').run('Example Movie 2', 'This is the second example movie.');
}

const tvCount = db.prepare('SELECT COUNT(*) as count FROM tvshows').get();
if (tvCount.count === 0) {
  db.prepare('INSERT INTO tvshows (title, description) VALUES (?, ?)').run('Example TV Series 1', 'This is the first example TV series.');
  db.prepare('INSERT INTO tvshows (title, description) VALUES (?, ?)').run('Example TV Series 2', 'This is the second example TV series.');
}

module.exports = db;