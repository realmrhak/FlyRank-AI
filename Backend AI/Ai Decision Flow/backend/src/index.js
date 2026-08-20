import express from 'express';
import cors from 'cors';
import { serve } from 'inngest/express';
import { inngest } from './inngestClient.js';
import { decideNode } from './functions/decideNode.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// This is the endpoint Inngest's dev server talks to. It exposes every
// function registered below so Inngest knows what it can run.
app.use('/api/inngest', serve({ client: inngest, functions: [decideNode] }));

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Inngest endpoint: http://localhost:${PORT}/api/inngest`);
});
