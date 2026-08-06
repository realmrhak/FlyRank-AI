# Task CRUD API

A simple Express.js REST API for managing tasks. Built across three storage stages as part of the FlyRank Backend AI Engineering track:

- **Week 2 (A1):** in-memory storage
- **Week 3 (A2):** SQLite file storage
- **Week 1 (A3, this version):** PostgreSQL running in Docker, with the whole stack (app + database) started by a single `docker compose up`

## Features

- Full CRUD support: Create, Read, Update, Delete tasks
- Persistent storage via a containerized PostgreSQL database
- The entire stack (API + database) starts with one command
- Secrets (database password) kept out of the codebase via `.env`
- Interactive API documentation via Swagger UI
- Parameterized SQL queries throughout (no string-glued SQL)

## Tech Stack

- Node.js + Express.js
- PostgreSQL 16 (Docker container)
- `pg` (node-postgres) driver
- Docker + Docker Compose
- Swagger UI (API documentation)

## Running the Whole Stack (one command)

### Prerequisites

- Docker Desktop installed and running

### Setup

1. Clone the repository:

   ```
   git clone <your-repo-url>
   cd <repo-folder-name>
   ```

2. Copy the example environment file and adjust if needed:

   ```
   cp .env.example .env
   ```

3. Start everything — the API and the Postgres database — with one command:

   ```
   docker compose up
   ```

4. The API will be available at `http://localhost:3000`. Postgres will be seeded automatically with 3 example tasks on first run.

To stop everything:

```
docker compose down
```

(Your data survives this — it lives in a Docker volume, not inside the container.)

### Environment Variables

See `.env.example` for the required variable:

| Variable       | Description                | Example                                        |
| -------------- | -------------------------- | ---------------------------------------------- |
| `DATABASE_URL` | Postgres connection string | `postgres://postgres:dev@localhost:5432/tasks` |

`.env` is git-ignored and holds your real values; `.env.example` is committed with placeholder values so anyone cloning the repo knows what to set.

### API Documentation

Once running, visit:

```
http://localhost:3000/api-docs
```

for interactive Swagger docs.

## API Endpoints

| Method | Endpoint     | Description                    |
| ------ | ------------ | ------------------------------ |
| GET    | `/health`    | Check if the server is running |
| GET    | `/tasks`     | Get all tasks                  |
| GET    | `/tasks/:id` | Get a single task by ID        |
| POST   | `/tasks`     | Create a new task              |
| PUT    | `/tasks/:id` | Update an existing task        |
| DELETE | `/tasks/:id` | Delete a task                  |

All endpoints behave identically across all three storage versions (in-memory → SQLite → Postgres) — only the storage layer changed each time.

### Example request

```
curl -i http://localhost:3000/tasks
```

```
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[
  { "id": 1, "title": "Learn Express basics", "done": false },
  { "id": 2, "title": "Build CRUD API", "done": false },
  { "id": 3, "title": "Push to GitHub", "done": false }
]
```

### Example: Task not found

**Request:**

```
GET /tasks/99
```

**Response (404 Not Found):**

```json
{ "error": "Task not found" }
```

## Status Codes Used

- `200` — Successful GET/PUT
- `201` — Task successfully created
- `204` — Task successfully deleted (no content returned)
- `400` — Invalid request (e.g. missing title)
- `404` — Task not found

## Database Screenshot

![Database Screenshot](postgres-screenshot.png)

## Proving Persistence

Created tasks via the API, ran `docker compose down` (which removes the containers), then `docker compose up` again. The previously created tasks were still present — proving the named volume (`taskdata`) kept the data independent of the container's lifecycle, not just the app process.

## Why This Setup

Postgres runs in Docker instead of being installed locally so the exact same database version and configuration work identically on any machine — no "works on my machine" problems. The database password lives in `.env`, never in the code or in Git history, following the standard practice of keeping config and secrets in the environment rather than hardcoded.

## Storage History

The API's behavior has stayed identical across all three storage swaps — proof that storage is just an implementation detail behind a stable interface:

| Stage     | Where tasks live  | What runs it       |
| --------- | ----------------- | ------------------ |
| A1        | a list in memory  | the Node process   |
| A2        | a `tasks.db` file | SQLite, on disk    |
| A3 (this) | rows in Postgres  | a Docker container |

## AI vs Me (Stage 6 — Bonus)

I wrote my own migration prompt from memory, specifying: Express + `pg` (no ORM), the `tasks` table schema, "create table if missing," "seed only when empty," the same 5 endpoints, parameterized queries, status codes (including 500 for unexpected errors), password from `.env` (never hardcoded), a named volume for persistence, and one-command startup via `docker compose up --build`.

I generated the AI's version into a separate `ai-version/` folder, ran it independently, and diffed it against my hand-built stack.

**What it did better:**

- Added a `healthcheck` on the `db` service (`pg_isready`) and made `api` depend on `db` with `condition: service_healthy`. My compose file only used `depends_on: [db]`, which waits for the container to _start_, not for Postgres to actually be _ready_ to accept connections — a real race condition my version doesn't guard against.
- Referenced the database password via `${POSTGRES_PASSWORD}` substitution in `compose.yaml`, pulled from `.env`. My compose file has the password (`dev`) hardcoded directly in `compose.yaml`, which technically contradicts my own prompt's "never hardcode passwords" requirement — my `.env` only fed the app's `DATABASE_URL`, not the `db` service's own password variable.
- Wrapped every route in `try/catch` with a `500` fallback for unexpected database errors. My hand-built routes have no error handling — an unexpected Postgres error would crash the app instead of returning a clean response.
- Added `restart: on-failure` on the `api` service, so a crashed container restarts automatically. Mine has no restart policy.

**What it got wrong or quietly decided for me:**

- Nothing broke a checkpoint — both versions pass the same read/write/persistence tests.
- The healthcheck and env-var substitution weren't things I explicitly asked for beyond "a volume for persistence" and "password from `.env`" — the AI correctly inferred that "password from `.env`" should extend to the `db` service's own `POSTGRES_PASSWORD`, which I hadn't been precise enough to specify myself.

**What my prompt forgot to specify:**

- I said the password should come from `.env`, but I didn't say _both_ services needed to read it from there — I only wired it into the app side. The AI applied the rule more consistently than I did in my own implementation.
- I didn't say anything about startup ordering/readiness beyond `depends_on`, so I got the basic (non-robust) version by default; the AI chose the safer healthcheck-based approach without being asked.
- I didn't specify a restart policy at all — the AI added one as a reasonable production default.

**One rematch:** I added "the `db` service's own password must also come from `.env`, not be hardcoded in `compose.yaml`" and "wait for Postgres to be ready, not just started, before the app connects" to my prompt and regenerated. The second version matched what the AI had already produced unprompted — confirming both were sensible defaults it applies whenever `.env`/persistence/startup ordering are mentioned, not one-off guesses.

The lesson from this stage, again: the gaps weren't the AI failing — they were places my own hand-built version was less rigorous than my own stated requirements. I only caught the password inconsistency because I had a second implementation to diff against my own.

## Notes

- Data is fully persistent — it survives both server restarts and `docker compose down`/`up` cycles.
- All CRUD operations use parameterized queries (`$1`, `$2`, ...) to avoid SQL injection.
- This project was built as part of an AI Fluency internship track, with Claude used as a pair-programming/tutoring tool throughout development.

## Author

Haroon Ameer Khan
