// A simple in-memory store for workflow run results.
// The Inngest function writes the final result here when a run finishes;
// the /api/run-workflow/:runId endpoint reads from here so the frontend
// can poll for completion. This is intentionally simple (no database) —
// fine for local development, would need Redis/a DB in production.

const runs = new Map();

export function setRunPending(runId) {
  runs.set(runId, { status: 'pending' });
}

export function setRunResult(runId, result) {
  runs.set(runId, { status: 'done', ...result });
}

export function setRunError(runId, error) {
  runs.set(runId, { status: 'error', error });
}

export function getRun(runId) {
  return runs.get(runId) ?? null;
}
