import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import db from './db.js';

const app = express();
const PORT = 3000;

// Parse incoming JSON request bodies so req.body works in POST/PUT routes
app.use(express.json());

// Serves the interactive Swagger docs at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Simple landing route, just confirms the server is up
app.get('/', (req, res) => {
  res.send('Server is running!');
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check server health
 *     responses:
 *       200:
 *         description: Server is healthy
 */
// Health check — used to confirm the API is reachable and responding
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     responses:
 *       200:
 *         description: List of all tasks
 *   post:
 *     summary: Create a new task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created
 *       400:
 *         description: Title is required
 */
// Returns every task from the database
app.get('/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.json(tasks);
});

// Creates a new task in the database; requires a non-empty title
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  const result = insert.run(title, 0);

  const newTask = {
    id: result.lastInsertRowid,
    title,
    done: 0,
  };

  res.status(201).json(newTask);
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found
 *   put:
 *     summary: Update a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               done:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Task updated
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete a task
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
// Returns a single task by ID, or 404 if it doesn't exist
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

// Updates a task's title and/or done status in the database
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, done } = req.body;
  const newTitle = title !== undefined ? title : existing.title;
  const newDone = done !== undefined ? (done ? 1 : 0) : existing.done;

  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(newTitle, newDone, id);

  const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.json(updatedTask);
});

// Deletes a task from the database by ID
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);

  if (!existing) {
    return res.status(404).json({ error: 'Task not found' });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
