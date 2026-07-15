# Task CRUD API

A simple Express.js REST API for managing tasks, built as part of the FlyRank Backend AI Engineering track (Week 2, Assignment 1).

## Features

- Full CRUD support: Create, Read, Update, Delete tasks
- In-memory storage (data resets on server restart)
- Input validation on task creation
- Interactive API documentation via Swagger UI

## Tech Stack

- Node.js
- Express.js
- Swagger UI (API documentation)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd <repo-folder-name>
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. The server will run at `http://localhost:3000`

### API Documentation

Once the server is running, visit:
```
http://localhost:3000/api-docs
```
to view and test all endpoints interactively via Swagger UI.

## API Endpoints

| Method | Endpoint      | Description                  |
|--------|---------------|-------------------------------|
| GET    | `/health`     | Check if the server is running |
| GET    | `/tasks`      | Get all tasks                 |
| GET    | `/tasks/:id`  | Get a single task by ID        |
| POST   | `/tasks`      | Create a new task              |
| PUT    | `/tasks/:id`  | Update an existing task        |
| DELETE | `/tasks/:id`  | Delete a task                  |

### Example: Create a task

**Request:**
```
POST /tasks
Content-Type: application/json

{
  "title": "Buy milk"
}
```

**Response (201 Created):**
```json
{
  "id": 4,
  "title": "Buy milk",
  "done": false
}
```

### Example: Task not found

**Request:**
```
GET /tasks/99
```

**Response (404 Not Found):**
```json
{
  "error": "Task not found"
}
```

## Status Codes Used

- `200` — Successful GET/PUT
- `201` — Task successfully created
- `204` — Task successfully deleted (no content returned)
- `400` — Invalid request (e.g. missing title)
- `404` — Task not found

## Notes

- Data is stored in memory, so all tasks reset when the server restarts.
- This project was built as part of an AI Fluency internship track, with Claude used as a pair-programming/tutoring tool throughout development.

## Author

Haroon Ameer Khan
