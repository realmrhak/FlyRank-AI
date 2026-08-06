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

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | `postgres://postgres:dev@localhost:5432/tasks` |

`.env` is git-ignored and holds your real values; `.env.example` is committed with placeholder values so anyone cloning the repo knows what to set.

### API Documentation

Once running, visit:
```
http://localhost:3000/api-docs
```
for interactive Swagger docs.

## API Endpoints

| Method | Endpoint      | Description                  |
|--------|---------------|-------------------------------|
| GET    | `/health`     | Check if the server is running |
| GET    | `/tasks`      | Get all tasks                 |
| GET    | `/tasks/:id`  | Get a single task by ID        |
| POST   | `/tasks`      | Create a new task              |
| PUT    | `/tasks/:id`  | Update an existing task        |
| DELETE | `/tasks/:id`  | Delete a task                  |

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

*(Insert a screenshot here showing the `tasks` table and its rows — e.g. from `docker exec -it taskdb psql -U postgres -d tasks -c "SELECT * FROM tasks;"`, or a GUI tool like DBeaver/pgAdmin/TablePlus.)*

## Proving Persistence

Created tasks via the API, ran `docker compose down` (which removes the containers), then `docker compose up` again. The previously created tasks were still present — proving the named volume (`taskdata`) kept the data independent of the container's lifecycle, not just the app process.

## Why This Setup

Postgres runs in Docker instead of being installed locally so the exact same database version and configuration work identically on any machine — no "works on my machine" problems. The database password lives in `.env`, never in the code or in Git history, following the standard practice of keeping config and secrets in the environment rather than hardcoded.

## Storage History (Stage 4 → Notes)

The API's behavior has stayed identical across all three storage swaps — proof that storage is just an implementation detail behind a stable interface:

| Stage | Where tasks live | What runs it |
|---|---|---|
| A1 | a list in memory | the Node process |
| A2 | a `tasks.db` file | SQLite, on disk |
| A3 (this) | rows in Postgres | a Docker container |

## Notes

- Data is fully persistent — it survives both server restarts and `docker compose down`/`up` cycles.
- All CRUD operations use parameterized queries (`$1`, `$2`, ...) to avoid SQL injection.
- This project was built as part of an AI Fluency internship track, with Claude used as a pair-programming/tutoring tool throughout development.

## Author

Haroon Ameer Khan
