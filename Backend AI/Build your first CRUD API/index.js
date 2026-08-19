import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import supabase from './supabase.js';
import db from './db.js';
import { enrichInputSchema, enrichOutputSchema } from './llm/schema/enrichSchema.js';

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

// Middleware — verifies the token and attaches the user to the request
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ') || !authHeader.split(' ')[1]) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = data.user;
  next();
}

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

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Missing or invalid input
 */
// Creates a new user account via Supabase Auth
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data.user);
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive an access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns access and refresh tokens
 *       400:
 *         description: Missing input
 *       401:
 *         description: Invalid credentials
 */
// Authenticates a user and returns their access/refresh tokens
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return res.status(401).json({ error: 'Invalid login credentials' });
  }

  res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

/**
 * @swagger
 * /public/info:
 *   get:
 *     summary: Public info, no auth required
 *     responses:
 *       200:
 *         description: Public message
 */
// Public route — no authentication needed
app.get('/public/info', (req, res) => {
  res.status(200).json({ message: 'Welcome stranger! This info is public.' });
});

/**
 * @swagger
 * /protected/profile:
 *   get:
 *     summary: Get the logged-in user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Missing, invalid, or expired token
 */
// Protected route — verifies the token with Supabase
app.get('/protected/profile', requireAuth, (req, res) => {
  res.status(200).json({
    id: req.user.id,
    email: req.user.email,
    created_at: req.user.created_at,
  });
});

/**
 * @swagger
 * /protected/dashboard:
 *   get:
 *     summary: Get the dashboard welcome message
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard message
 *       401:
 *         description: Missing, invalid, or expired token
 */
app.get('/protected/dashboard', requireAuth, (req, res) => {
  res.status(200).json({ message: `Welcome to your dashboard, ${req.user.email}!` });
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out the current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Logout successful
 *       401:
 *         description: Missing, invalid, or expired token
 */
app.post('/auth/logout', requireAuth, async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  await supabase.auth.signOut(token);
  res.status(204).send();
});

/**
 * POST /tasks/enrich
 * Takes a task title and returns a suggested category, priority, and note.
 * LLM_STUB=1 skips the AI call and returns a fixed fake answer, for testing.
 */
app.post('/tasks/enrich', (req, res) => {
  // Step 1: validate the input BEFORE spending any AI call
  const parseResult = enrichInputSchema.safeParse(req.body);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0];
    return res.status(400).json({
      error: `Invalid input: ${firstError.path.join('.')} — ${firstError.message}`,
    });
  }

  // Step 2: stub mode — return a fake answer, no AI call at all
  if (process.env.LLM_STUB === '1') {
    const stubResponse = {
      category: 'work',
      priority: 'medium',
      suggestion: 'This is a stub response for testing.',
      confidence: 0.5,
    };

    const validated = enrichOutputSchema.safeParse(stubResponse);
    return res.status(200).json(validated.data);
  }

  // Step 3: real AI call will go here in Stage 2/3
  res.status(501).json({ error: 'AI call not implemented yet — coming in Stage 2' });
});

app.listen(PORT, () => {
  console.log(`Server running and connected to Supabase on http://localhost:${PORT}`);
});