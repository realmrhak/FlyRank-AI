import Database from 'better-sqlite3';

// Opens (or creates) the tasks.db file — this is our entire database
const db = new Database('tasks.db');

// Create the tasks table if it doesn't already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

// Seed 3 example tasks, but only if the table is currently empty
const row = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

if (row.count === 0) {
   const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
   insert.run('Learn Express basics', 0);
   insert.run('Build CRUD API', 0);
   insert.run('Push to GitHub', 0);
}

export default db;