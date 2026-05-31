# Valenix MVP Architecture

## Architecture Goals

- Ship the MVP quickly.
- Keep operational cost low.
- Keep service boundaries simple.
- Preserve a clear path to horizontal scaling.
- Avoid building enterprise, RAG, or mobile complexity before demand is validated.

## High-Level System

Valenix uses a split web/API/model architecture:

- Next.js frontend for the web application and lightweight server-rendered pages.
- FastAPI backend for authentication validation, chat orchestration, billing webhooks, usage tracking, and model routing.
- PostgreSQL for durable application data.
- Redis for rate limiting, short-lived routing state, queues, locks, and cached usage counters.
- Dedicated Ollama model servers for inference.
- Stripe for subscription billing.
- Google OAuth and email/password for identity.

```text
Browser
  |
  | HTTPS
  v
Next.js Web App
  |
  | HTTPS / internal API token
  v
FastAPI Backend
  |        |         |
  |        |         +--> Stripe API / Webhooks
  |        +------------> PostgreSQL
  +---------------------> Redis
  |
  | private network
  v
Ollama Model Servers
```

## Service Responsibilities

### Next.js Frontend

- Landing page.
- Google OAuth login, email/password signup/login, and session-aware app UI.
- Chat UI with streaming response rendering.
- Conversation list, conversation view, settings, and billing entry points.
- Minimal onboarding.
- Calls FastAPI for product data and chat operations.

### FastAPI Backend

- Owns application API.
- Validates authenticated users.
- Enforces subscription and fair-use limits.
- Persists conversations and messages.
- Routes chat requests to model servers.
- Streams model responses back to the frontend.
- Handles Stripe Checkout, Customer Portal, and webhooks.
- Records usage events.
- Exposes health endpoints.

### PostgreSQL

- Durable source for users, accounts, subscriptions, conversations, messages, model servers, usage events, and fair-use policy configuration.
- Supports analytics queries for MVP demand validation.

### Redis

- Per-user rate limiting.
- Daily/monthly usage counters for fast limit checks.
- Model server health and temporary saturation state.
- Idempotency locks for webhook and generation workflows.
- Optional lightweight queueing for non-critical post-processing.

### Ollama Model Servers

- Run one or more open-source models.
- Expose Ollama HTTP API only on a private network.
- Do not store user data beyond transient request processing.
- Report health and model availability to the backend.

## Request Flow

### Chat Request

1. Browser sends a message to the Next.js app.
2. Next.js calls FastAPI with the user session token.
3. FastAPI validates the user and conversation ownership.
4. FastAPI checks subscription state and fair-use allowance.
5. FastAPI creates the user message in PostgreSQL.
6. FastAPI selects a healthy model server.
7. FastAPI sends the prompt and conversation context to Ollama.
8. FastAPI streams response chunks to the client.
9. FastAPI stores the assistant message and usage event.
10. Redis counters are incremented and PostgreSQL is updated for durable usage history.

### Billing Flow

1. User requests upgrade.
2. FastAPI creates a Stripe Checkout Session.
3. Browser redirects to Stripe.
4. Stripe sends webhook events to FastAPI.
5. FastAPI verifies webhook signature.
6. FastAPI upserts customer and subscription state.
7. User tier changes based on local subscription state.

## Missing Product Requirements

- Exact fair-use thresholds.
- Whether users can select models.
- Whether Pro users receive priority routing.
- Required retention and deletion policy.
- Abuse handling policy.
- Safety and moderation policy.
- Support and refund processes.
- Whether anonymous landing traffic should be tracked.

## Technical Risks

### Model Quality

Open-source models may underperform user expectations set by commercial assistants. MVP should present itself honestly and optimize for responsiveness.

### Inference Cost And Saturation

"Unlimited" positioning can create cost exposure. The architecture must use fair-use limits, throttling, and model capacity monitoring from day one.

### Streaming Reliability

Streaming through multiple layers can fail due to timeouts, proxies, and client disconnects. The backend needs cancellation handling and conservative timeouts.

### Stripe State Drift

Subscription access can become incorrect if webhooks are missed or processed non-idempotently. Stripe webhooks must be idempotent, and periodic reconciliation should be added soon after MVP.

### Authentication Complexity

Supporting both Google OAuth and email/password improves signup flexibility but adds password storage, reset flows, email verification decisions, account linking rules, and secure session management.

### Context Window Growth

Long conversations increase latency and cost. The MVP needs context truncation even without RAG.

### GPU Availability

Dedicated model servers may have limited GPU availability or expensive hourly cost. The routing layer must support adding and removing model servers without frontend changes.

## Scalability Concerns

- Chat generation requests are long-lived and can consume worker capacity.
- A single backend instance can become constrained by concurrent streaming connections.
- PostgreSQL message tables will grow quickly.
- Redis counters must not be the only durable usage record.
- Model server routing needs backpressure to avoid sending too many concurrent requests to a single GPU.
- Pro users may consume disproportionate inference capacity.
- Conversation context must be bounded to control token costs.

## MVP Architecture Decisions

### Keep One Backend Service

Use one FastAPI service for auth-aware API, billing, usage, and routing. Split later only when measured load justifies it.

### Keep Model Servers Stateless

Model servers should only run Ollama and expose inference. Application state stays in PostgreSQL and Redis.

### Use Configurable Policies

Store fair-use policy in the database or environment-backed config so limits can change quickly after launch.

### Use Server-Side Authorization

Every user-specific operation checks ownership and tier in FastAPI.

### Use Streaming From Backend

The browser should not call Ollama directly. FastAPI owns routing, accounting, and cancellation.

## Future Scalability Path

- Add more model servers behind the router.
- Add per-tier queues or priority routing.
- Split chat orchestration into dedicated workers if backend web workers saturate.
- Add periodic Stripe reconciliation.
- Partition or archive old messages.
- Add managed observability.
- Add moderation and abuse detection.
- Add RAG only after core chat demand is validated.
