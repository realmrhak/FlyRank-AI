import { inngest } from '../inngestClient.js';
import { llmClient } from '../llmClient.js';
import { setRunResult, setRunError } from '../runStore.js';

const MAX_STEPS = 20; // safety limit in case the graph has a cycle

/**
 * Asks the AI a single yes/no question. Kept as its own function so each
 * call can be wrapped in step.run() — this is what "each node maps to an
 * Inngest step" means: every node's decision is a separately tracked,
 * separately retryable unit of work.
 */
async function askYesNo(prompt) {
  const response = await llmClient.chat.completions.create({
    model: process.env.LLM_MODEL,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content:
          'You are a strict yes/no decision engine. Respond with ONLY the single word YES or the single word NO. Never explain, never add punctuation, never say anything else.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const raw = response.choices[0].message.content.trim().toUpperCase();
  return raw.includes('YES') ? 'YES' : 'NO';
}

/**
 * Walks the decision graph starting at startNodeId. At each node, it asks
 * the AI the node's question, then follows the edge whose `kind` ('yes' or
 * 'no') matches the answer. Stops when there's no matching outgoing edge
 * (a leaf / end node) or when MAX_STEPS is hit (cycle protection).
 */
export const executeWorkflow = inngest.createFunction(
  { id: 'execute-workflow' },
  { event: 'workflow/run.requested' },
  async ({ event, step }) => {
    const { runId, nodes, edges, startNodeId } = event.data;

    const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const path = [];
    let currentId = startNodeId;
    let stepCount = 0;

    try {
      while (currentId && stepCount < MAX_STEPS) {
        const node = nodeById[currentId];
        if (!node) break; // dangling edge, stop safely

        stepCount++;

        const answer = await step.run(`ask-node-${currentId}`, () => askYesNo(node.data.label));

        path.push({ nodeId: currentId, prompt: node.data.label, answer });

        // Find the outgoing edge whose kind matches the AI's answer
        const kind = answer === 'YES' ? 'yes' : 'no';
        const nextEdge = edges.find((e) => e.source === currentId && e.kind === kind);

        currentId = nextEdge ? nextEdge.target : null;
      }

      const result = {
        path,
        endedBecause: stepCount >= MAX_STEPS ? 'max_steps_reached' : 'no_matching_edge',
      };

      await step.run('save-result', async () => {
        setRunResult(runId, result);
      });

      return result;
    } catch (err) {
      await step.run('save-error', async () => {
        setRunError(runId, err.message || 'Workflow execution failed');
      });
      throw err;
    }
  }
);
