# Valenix MVP Deployment Architecture

## Deployment Goals

- Low cost.
- Simple operations.
- Fast iteration.
- Private model servers.
- Clear path to horizontal scale.

## Environments

### Local Development

Use Docker Compose for:

- PostgreSQL.
- Redis.
- FastAPI backend.
- Next.js frontend.
- Optional local Ollama container or externally running Ollama.
- Fake or test Stripe webhook forwarding through Stripe CLI.

### Staging

Staging should mirror production enough to test:

- Google OAuth redirect URLs.
- Email/password signup, login, verification, and password reset flows.
- Stripe test mode.
- Webhook processing.
- Model server routing.
- Database migrations.

### Production

MVP production can run on a small number of virtual machines or container services:

- One web/API node to start.
- One managed PostgreSQL instance if budget allows.
- One managed Redis instance if budget allows.
- One or more GPU model servers running Ollama.
- Reverse proxy or load balancer with TLS.

## Recommended MVP Production Topology

```text
Internet
  |
  v
TLS Load Balancer / Reverse Proxy
  |
  +--> Next.js Web Container
  |
  +--> FastAPI API Container
          |
          +--> Managed PostgreSQL
          +--> Managed Redis
          +--> Private Ollama Model Server 1
          +--> Private Ollama Model Server 2
```

For the fastest low-cost launch, web and API can run on the same non-GPU VM. Model inference should run on separate GPU nodes.

## Docker Compose Services

Expected local services:

- `web`: Next.js app.
- `api`: FastAPI app.
- `postgres`: PostgreSQL.
- `redis`: Redis.
- `ollama`: optional local model server.

Production Compose can be used initially on a VM, but managed platforms are preferable once traffic grows.

## Networking

- Public access only to the reverse proxy, web app, and API.
- PostgreSQL and Redis are private.
- Ollama model servers are private.
- FastAPI is the only service allowed to call Ollama.
- Stripe webhooks must be publicly reachable by Stripe.

## Authentication Deployment

Google OAuth configuration:

- Configure authorized JavaScript origins for the frontend domain.
- Configure authorized redirect URIs for the auth callback domain.
- Store client ID and secret in environment secrets.
- Use separate OAuth credentials for local, staging, and production if possible.

Email/password configuration:

- Use a modern password hashing algorithm such as Argon2id or bcrypt.
- Configure transactional email for verification and password reset messages.
- Store email provider credentials in environment secrets.
- Use generic login and reset errors to avoid account enumeration.
- Rate-limit signup, login, verification, and password reset endpoints.

Session configuration:

- Use secure cookies in production.
- Use `SameSite=Lax` unless cross-site behavior requires otherwise.
- Rotate `SESSION_SECRET` only with a planned session invalidation.

## Stripe Deployment

Stripe setup:

- Create one Product: `Valenix Pro`.
- Create one recurring monthly Price: `$5/month`.
- Store `STRIPE_PRO_PRICE_ID` in backend environment.
- Enable Customer Portal.
- Configure production webhook endpoint:

```text
https://api.valenix.ai/api/v1/webhooks/stripe
```

Webhook requirements:

- Verify signature.
- Store every Stripe event ID.
- Process events idempotently.
- Alert on webhook processing failures.

## Model Server Deployment

Each model server should:

- Run Ollama.
- Pull only approved MVP models.
- Expose Ollama API on a private interface.
- Have enough disk for model weights.
- Have GPU monitoring enabled where available.
- Be registered in the `model_servers` table.

Recommended MVP model server policy:

- Start with one stable model.
- Add a second server only when saturation is observed or launch risk requires redundancy.
- Keep model choice server-side to avoid frontend coupling.

## Model Routing Architecture

FastAPI model router should:

- Query enabled model servers from PostgreSQL.
- Use Redis for current in-flight request counts and cooldowns.
- Prefer healthy servers with capacity.
- Avoid servers in cooldown after failures.
- Enforce per-server `max_concurrent_requests`.
- Timeout requests conservatively.
- Mark failed requests in `model_requests`.

Suggested selection order:

1. Server has requested model.
2. Server status is `healthy`.
3. Server is not in Redis cooldown.
4. In-flight count is below capacity.
5. Lowest priority value.
6. Lowest current in-flight count.

## Usage Tracking Architecture

FastAPI should record usage in two layers:

- Redis counters for immediate fair-use checks.
- PostgreSQL `usage_events` for durable analytics and reconciliation.

On generation start:

- Check daily and monthly counters.
- Check active generation lock.
- Create user message.
- Create model request.

On generation success:

- Estimate input and output tokens.
- Store assistant message.
- Create usage event.
- Increment Redis counters.
- Complete model request.

On failure:

- Store failure state.
- Create failed usage event if useful for abuse or reliability analysis.
- Release concurrency locks.

## Fair-Use Limit Architecture

Fair-use checks happen before routing to Ollama.

Policy inputs:

- User tier.
- Subscription status.
- Daily message usage.
- Monthly message usage.
- Estimated token usage if enabled.
- Active generation count.
- Global capacity state.

Suggested MVP policies:

| Tier | Daily Messages | Monthly Messages | Concurrent Generations |
| --- | ---: | ---: | ---: |
| Free | 25 | 500 | 1 |
| Pro | 500 | 10,000 | 2 |

Capacity protection:

- If all model servers are saturated, return `503 model_capacity_unavailable`.
- If a user exceeds limits, return `429 rate_limited`.
- During severe saturation, temporarily reduce free-tier access before Pro access.

## Observability

Minimum production logs:

- Request ID.
- User ID.
- Endpoint.
- Conversation ID.
- Model.
- Model server ID.
- Latency.
- Error code.
- Stripe event ID.

Minimum metrics:

- API request count and latency.
- Chat generation count and latency.
- Model server in-flight requests.
- Model server failures.
- Redis fair-use limit rejections.
- Stripe webhook failures.

## Backup And Recovery

- Enable daily PostgreSQL backups.
- Test restore before launch if using managed database.
- Redis does not need to be a source of truth.
- Store infrastructure secrets outside the repository.
- Document manual recovery steps for failed migrations and broken webhook processing.

## Launch Checklist

- Production Google OAuth credentials configured.
- Transactional email provider configured.
- Password reset flow tested.
- Email verification flow tested if required before launch.
- Stripe product, price, portal, and webhook configured.
- Webhook signature verification tested.
- Database migrations applied.
- Free and Pro fair-use policies seeded.
- At least one model server registered and healthy.
- TLS enabled.
- Environment variables set.
- Health checks passing.
- Basic chat smoke test passing.
- Upgrade and cancellation flow tested in Stripe test mode before switching to live mode.
