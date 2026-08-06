import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE
    )
  `);

  const { rows } = await pool.query('SELECT COUNT(*) AS count FROM tasks');

  if (Number(rows[0].count) === 0) {
    const seedTasks = ['Learn Express basics', 'Build CRUD API', 'Push to GitHub'];
    for (const title of seedTasks) {
      await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', [title, false]);
    }
  }
}

export { pool, initDb };
