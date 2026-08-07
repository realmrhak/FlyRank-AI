import express from 'express';
import db from './db.js';

const app = express();
const PORT = 3000;

app.use(express.json());

/**
 * GET /tasks
 * Returns all tasks.
 */
app.get('/tasks', (req, res) => {
  try {
    const tasks = db.prepare('SELECT * FROM tasks').all();
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /tasks/:id
 * Returns a single task by id, or 404 if not found.
 */
app.get('/tasks/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /tasks
 * Creates a new task. Requires a non-empty title.
 */
app.post('/tasks', (req, res) => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
    const result = insert.run(title, 0);

    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /tasks/:id
 * Updates an existing task's title and/or done status.
 */
app.put('/tasks/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { title, done } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Title must be a non-empty string' });
    }

    const newTitle = title !== undefined ? title : existing.title;
    const newDone = done !== undefined ? (done ? 1 : 0) : existing.done;

    db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(newTitle, newDone, id);

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /tasks/:id
 * Deletes a task by id.
 */
app.delete('/tasks/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
