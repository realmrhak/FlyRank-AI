import express from 'express';
import { pool, initDb } from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/tasks', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks ORDER BY id');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { rows } = await pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
      [title, false]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, done } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }

    const newTitle = title !== undefined ? title : existing.rows[0].title;
    const newDone = done !== undefined ? done : existing.rows[0].done;

    const { rows } = await pool.query(
      'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
      [newTitle, newDone, id]
    );

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
