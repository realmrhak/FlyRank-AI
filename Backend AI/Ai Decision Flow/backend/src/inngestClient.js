import { Inngest } from 'inngest';

// This is the shared Inngest client. Every workflow step (function) in this
// project is registered against this same client so Inngest can find them.
export const inngest = new Inngest({ id: 'ai-decision-flow' });
