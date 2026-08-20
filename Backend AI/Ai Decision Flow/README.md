# AI Decision Flow

A visual AI workflow builder. Each node on the canvas is a yes/no question;
connecting nodes with edges builds a decision tree that an AI model walks
through when the workflow runs.

**Status: Phase 1 (Setup) complete.**
- ✅ React (Vite) frontend with a working React Flow canvas
- ✅ Express backend with Inngest wired up and a working dev server
- ✅ One working Inngest function (`decide-node`) that asks the AI a
  yes/no question and returns strictly `YES` or `NO`
- ⬜ Phase 2: full visual editor (editable prompts, YES/NO edge types)
- ⬜ Phase 3: multi-node workflow traversal
- ⬜ Phase 4: polish features

## Project structure

```
ai-decision-flow/
├── frontend/          React app (Vite) — the visual canvas
│   └── src/App.jsx    React Flow canvas with an "Add Node" button
└── backend/           Express + Inngest + OpenAI (via OpenRouter)
    └── src/
        ├── index.js              Express server, serves Inngest
        ├── inngestClient.js      Shared Inngest client
        ├── llmClient.js          OpenRouter-configured OpenAI client
        └── functions/
            └── decideNode.js     Inngest function: ask AI a yes/no question
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your OpenRouter API key (same key from the Week 7
assignment works here — get one free at https://openrouter.ai/keys).

Run the backend:
```bash
npm run dev
```

In a **separate terminal**, run the Inngest dev server (this is what lets
you see workflow runs in a nice UI, and lets Inngest actually call your
function):
```bash
npm run inngest:dev
```

This opens a dashboard at `http://localhost:8288` where you can see and
trigger workflow runs.

### 2. Frontend

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

This opens the visual canvas at `http://localhost:5173`.

## Testing the one working AI function right now

With the backend and Inngest dev server both running, you can trigger the
`decide-node` function directly from the Inngest dashboard
(`http://localhost:8288` → Functions → decide-node → Invoke), sending:

```json
{
  "data": {
    "prompt": "Is this a support request? Message: My order hasn't arrived yet."
  }
}
```

It should return `{"prompt": "...", "answer": "YES"}`.

## Next steps (Phase 2)

- Make node prompts editable directly on the canvas
- Add two edge types (YES / NO) so connections are meaningful
- Store the graph (nodes + edges) in local state so it persists while editing
