# Valenix

Valenix is an MVP AI chat product built with Next.js, TypeScript, Tailwind, FastAPI, PostgreSQL, Redis, and Docker Compose.

Phase 1 includes:

- Email/password signup and login.
- Cookie-based authenticated sessions.
- Protected chat routes.
- ChatGPT-style chat layout.
- New Chat button.
- Sidebar chat history.
- Persistent conversations and messages.
- Streaming chat responses.
- FastAPI backend skeleton.
- PostgreSQL SQLAlchemy models.
- Docker Compose local stack.

Phase 1 intentionally does not include Stripe, Pro plans, RAG, file uploads, admin dashboards, or teams.

## Project Structure

```text
apps/web        Next.js frontend
services/api    FastAPI backend
docker-compose.yml
.env.example
```

## Setup

Prerequisites:

- Docker and Docker Compose.
- Node.js 20+ and pnpm if running the frontend outside Docker.
- Python 3.12+ if running the backend outside Docker.

Create a local environment file if you want to override defaults:

```bash
cp .env.example .env
```

The Docker Compose setup works without a `.env` file because development defaults are defined in `docker-compose.yml`.

## Docker Development

Start the full stack:

```bash
docker compose up --build
```

Open:

```text
http://localhost:3000
```

Backend health check:

```text
http://localhost:8000/healthz
```

PostgreSQL is exposed on `localhost:5432`.
Redis is exposed on `localhost:6379`.

The API creates the Phase 1 database tables automatically on startup.

## Local Development Without Docker

Start PostgreSQL and Redis locally, then configure:

```bash
cp .env.example .env
```

Use local service URLs in `.env`:

```text
DATABASE_URL=postgresql+asyncpg://valenix:valenix@localhost:5432/valenix
REDIS_URL=redis://localhost:6379/0
FRONTEND_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
SESSION_SECRET=change-me-in-development
```

Run the backend:

```bash
cd services/api
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Run the frontend:

```bash
cd apps/web
corepack enable
pnpm install
pnpm dev
```

## Chat Streaming

By default, chat uses a local fallback streamer so the product works without a model server.

To use Ollama, set:

```text
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

The browser never calls Ollama directly. The FastAPI backend owns persistence and streaming.

## Environment Variables

See [.env.example](/Users/jillhansalia/valenix/.env.example) for the complete development example.
