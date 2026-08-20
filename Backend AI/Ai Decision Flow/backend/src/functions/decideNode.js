import { inngest } from '../inngestClient.js';
import { llmClient } from '../llmClient.js';

/**
 * This Inngest function represents ONE decision node in the workflow.
 * It sends the node's yes/no question to the AI and returns strictly
 * "YES" or "NO" — nothing else is a valid answer.
 *
 * This is Phase 1/2 scaffolding: the function is wired up and callable,
 * but the full multi-node traversal logic (Phase 3) is not built yet —
 * that's the next piece to add once the visual editor (Phase 2) is done.
 */
export const decideNode = inngest.createFunction(
  { id: 'decide-node' },
  { event: 'workflow/node.evaluate' },
  async ({ event, step }) => {
    const { prompt } = event.data;

    const answer = await step.run('ask-ai-yes-no', async () => {
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
    });

    return { prompt, answer };
  }
);
