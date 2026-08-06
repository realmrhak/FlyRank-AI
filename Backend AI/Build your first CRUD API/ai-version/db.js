import Database from 'better-sqlite3';

const db = new Database('ai-tasks.db');

// Create the tasks table if it doesn't already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

// Seed sample tasks only if the table is currently empty
const { count } = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

if (count === 0) {
  const insertSeed = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const seedTasks = ['Learn Express basics', 'Build CRUD API', 'Push to GitHub'];

  const insertMany = db.transaction((titles) => {
    for (const title of titles) {
      insertSeed.run(title, 0);
    }
  });

  insertMany(seedTasks);
}

export default db;
