import pg from 'pg';

const { Pool } = pg;

// Connects using DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the tasks table if it doesn't already exist
await pool.query(`
  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT false
  )
`);

// Seed 3 example tasks, but only if the table is currently empty
const { rows } = await pool.query('SELECT COUNT(*) FROM tasks');

if (Number(rows[0].count) === 0) {
  await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Learn Express basics', false]);
  await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Build CRUD API', false]);
  await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Push to GitHub', false]);
}

export default pool;