import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { serve } from 'inngest/express';
import { inngest } from './inngestClient.js';
import { decideNode } from './functions/decideNode.js';
import { executeWorkflow } from './functions/executeWorkflow.js';
import { setRunPending, getRun } from './runStore.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// This is the endpoint Inngest's dev server talks to. It exposes every
// function registered below so Inngest knows what it can run.
app.use(
  '/api/inngest',
  serve({ client: inngest, functions: [decideNode, executeWorkflow] })
);

/**
 * POST /api/run-workflow
 * Kicks off a workflow run. Returns immediately with a runId — the actual
 * execution happens asynchronously via Inngest (see executeWorkflow.js).
 * The frontend polls GET /api/run-workflow/:runId to find out when it's done.
 */
app.post('/api/run-workflow', async (req, res) => {
  const { nodes, edges, startNodeId } = req.body;

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return res.status(400).json({ error: 'nodes array is required and cannot be empty' });
  }
  if (!startNodeId) {
    return res.status(400).json({ error: 'startNodeId is required' });
  }

  const runId = randomUUID();
  setRunPending(runId);

  await inngest.send({
    name: 'workflow/run.requested',
    data: { runId, nodes, edges, startNodeId },
  });

  res.status(202).json({ runId });
});

/**
 * GET /api/run-workflow/:runId
 * Lets the frontend poll for the result of a run started above.
 */
app.get('/api/run-workflow/:runId', (req, res) => {
  const run = getRun(req.params.runId);

  if (!run) {
    return res.status(404).json({ error: 'Run not found' });
  }

  res.json(run);
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Inngest endpoint: http://localhost:${PORT}/api/inngest`);
});
