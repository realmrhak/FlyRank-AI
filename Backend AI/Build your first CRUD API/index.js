import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import supabase from './supabase.js';
import db from './db.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Returns every task from the database
app.get('/tasks', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM tasks');
  res.json(rows);
});

// Returns a single task by ID, or 404 if it doesn't exist
app.get('/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);

  if (rows.length === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(rows[0]);
});

// Creates a new task; requires a non-empty title
app.post('/tasks', async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const { rows } = await db.query(
    'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
    [title, false]
  );

  res.status(201).json(rows[0]);
});

// Updates a task's title and/or done status
app.put('/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);

  if (existing.rows.length === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, done } = req.body;
  const newTitle = title !== undefined ? title : existing.rows[0].title;
  const newDone = done !== undefined ? done : existing.rows[0].done;

  const { rows } = await db.query(
    'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
    [newTitle, newDone, id]
  );

  res.json(rows[0]);
});

// Deletes a task by ID
app.delete('/tasks/:id', async (req, res) => {
  const id = Number(req.params.id);
  const existing = await db.query('SELECT * FROM tasks WHERE id = $1', [id]);

  if (existing.rows.length === 0) {
    return res.status(404).json({ error: 'Task not found' });
  }

  await db.query('DELETE FROM tasks WHERE id = $1', [id]);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running and connected to Supabase on http://localhost:${PORT}`);
});