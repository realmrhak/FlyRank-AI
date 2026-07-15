import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const PORT = 3000;

app.use(express.json());

const swaggerOptions = {
   definition: {
      openapi: '3.0.0',
      info: {
         title: 'Task CRUD API',
         version: '1.0.0',
         description: 'A simple CRUD API for managing tasks',
      },
   },
   apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

let tasks = [
   { id: 1, title: 'Learn Express basics', done: false },
   { id: 2, title: 'Build CRUD API', done: false },
   { id: 3, title: 'Push to GitHub', done: false },
];

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
app.get('/tasks', (req, res) => {
   res.json(tasks);
});

app.post('/tasks', (req, res) => {
   const { title } = req.body;

   if (!title) {
      return res.status(400).json({ error: 'Title is required' });
   }

   const newTask = {
      id: tasks.length + 1,
      title,
      done: false,
   };

   tasks.push(newTask);
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
app.get('/tasks/:id', (req, res) => {
   const id = Number(req.params.id);
   const task = tasks.find((t) => t.id === id);

   if (!task) {
      return res.status(404).json({ error: 'Task not found' });
   }

   res.json(task);
});

app.put('/tasks/:id', (req, res) => {
   const id = Number(req.params.id);
   const task = tasks.find((t) => t.id === id);

   if (!task) {
      return res.status(404).json({ error: 'Task not found' });
   }

   const { title, done } = req.body;

   if (title !== undefined) task.title = title;
   if (done !== undefined) task.done = done;

   res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
   const id = Number(req.params.id);
   const index = tasks.findIndex((t) => t.id === id);

   if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
   }

   tasks.splice(index, 1);
   res.status(204).send();
});

app.listen(PORT, () => {
   console.log(`Server listening on http://localhost:${PORT}`);
});