# Valenix MVP Database Design

## Database Stack

- PostgreSQL is the durable system of record.
- Redis stores short-lived counters, locks, and routing state.
- UUID primary keys are recommended for user-facing records.
- Timestamps should use `timestamptz`.
- Soft deletes are optional for MVP, but account and billing audit records should not be casually hard-deleted.

## Core Tables

### users

Stores the application user.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Internal user ID |
| email | text unique not null | Primary account email |
| email_verified_at | timestamptz | Email verification timestamp |
| name | text | Display name |
| avatar_url | text | Profile image |
| tier | text not null | `free` or `pro` |
| status | text not null | `active`, `suspended`, `deleted` |
| created_at | timestamptz not null | Creation time |
| updated_at | timestamptz not null | Update time |
| last_login_at | timestamptz | Last successful login |

Indexes:

- Unique index on `email`.
- Index on `tier`.

### oauth_accounts

Keeps OAuth provider identity separate from the user.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Account ID |
| user_id | uuid fk users(id) | Owner |
| provider | text not null | `google` |
| provider_subject | text not null | Google `sub` |
| email | text not null | Provider email at login |
| created_at | timestamptz not null | Creation time |
| updated_at | timestamptz not null | Update time |

Indexes:

- Unique index on `(provider, provider_subject)`.
- Index on `user_id`.

### password_credentials

Stores password login credentials for users who sign up with email and password.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Credential ID |
| user_id | uuid fk users(id) unique | Owner |
| password_hash | text not null | Argon2id or bcrypt password hash |
| password_updated_at | timestamptz not null | Last password change |
| reset_required | boolean not null default false | Force reset flag |
| created_at | timestamptz not null | Creation time |
| updated_at | timestamptz not null | Update time |

Indexes:

- Unique index on `user_id`.

### email_verification_tokens

Stores single-use email verification tokens for password-based accounts.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Token ID |
| user_id | uuid fk users(id) | Owner |
| token_hash | text unique not null | Hashed verification token |
| expires_at | timestamptz not null | Expiration time |
| used_at | timestamptz | Consumption time |
| created_at | timestamptz not null | Creation time |

Indexes:

- Unique index on `token_hash`.
- Index on `(user_id, created_at desc)`.

### password_reset_tokens

Stores single-use password reset tokens.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Token ID |
| user_id | uuid fk users(id) | Owner |
| token_hash | text unique not null | Hashed reset token |
| expires_at | timestamptz not null | Expiration time |
| used_at | timestamptz | Consumption time |
| created_at | timestamptz not null | Creation time |

Indexes:

- Unique index on `token_hash`.
- Index on `(user_id, created_at desc)`.

### subscriptions

Stores latest known Stripe subscription state.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Internal subscription ID |
| user_id | uuid fk users(id) unique | Owner |
| stripe_customer_id | text unique | Stripe customer |
| stripe_subscription_id | text unique | Stripe subscription |
| stripe_price_id | text | Stripe price for $5 plan |
| status | text not null | Stripe status, e.g. `active`, `trialing`, `past_due`, `canceled` |
| current_period_start | timestamptz | Current billing period start |
| current_period_end | timestamptz | Current billing period end |
| cancel_at_period_end | boolean not null default false | Cancellation state |
| created_at | timestamptz not null | Creation time |
| updated_at | timestamptz not null | Update time |

Indexes:

- Unique index on `stripe_customer_id`.
- Unique index on `stripe_subscription_id`.
- Index on `user_id`.
- Index on `status`.

### conversations

Stores chat threads.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Conversation ID |
| user_id | uuid fk users(id) | Owner |
| title | text not null | Generated or user-edited title |
| model | text | Default model used for conversation |
| archived_at | timestamptz | Optional archive marker |
| deleted_at | timestamptz | Optional soft-delete marker |
| created_at | timestamptz not null | Creation time |
| updated_at | timestamptz not null | Update time |

Indexes:

- Index on `(user_id, updated_at desc)`.
- Index on `deleted_at`.

### messages

Stores user and assistant messages.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Message ID |
| conversation_id | uuid fk conversations(id) | Parent conversation |
| user_id | uuid fk users(id) | Owner for authorization and analytics |
| role | text not null | `user`, `assistant`, or `system` |
| content | text not null | Message body |
| status | text not null | `complete`, `streaming`, `failed`, `canceled` |
| model | text | Model used for assistant response |
| input_tokens_est | integer | Estimated input tokens |
| output_tokens_est | integer | Estimated output tokens |
| latency_ms | integer | Assistant response latency |
| error_code | text | Failure code |
| created_at | timestamptz not null | Creation time |
| updated_at | timestamptz not null | Update time |

Indexes:

- Index on `(conversation_id, created_at)`.
- Index on `(user_id, created_at desc)`.
- Index on `status`.

### usage_events

Append-only usage ledger.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Usage event ID |
| user_id | uuid fk users(id) | Owner |
| conversation_id | uuid fk conversations(id) | Related conversation |
| message_id | uuid fk messages(id) | Related assistant message |
| subscription_tier | text not null | Tier at time of usage |
| model | text not null | Model used |
| input_tokens_est | integer not null default 0 | Estimated prompt tokens |
| output_tokens_est | integer not null default 0 | Estimated response tokens |
| total_tokens_est | integer not null default 0 | Input + output |
| request_started_at | timestamptz not null | Start time |
| request_completed_at | timestamptz | End time |
| latency_ms | integer | Latency |
| status | text not null | `success`, `failed`, `canceled` |
| error_code | text | Failure reason |
| created_at | timestamptz not null | Creation time |

Indexes:

- Index on `(user_id, created_at desc)`.
- Index on `(user_id, subscription_tier, created_at)`.
- Index on `(model, created_at desc)`.

### model_servers

Registry for model-serving nodes.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Server ID |
| name | text not null | Human-readable name |
| base_url | text not null | Private Ollama URL |
| status | text not null | `healthy`, `degraded`, `offline`, `disabled` |
| models | jsonb not null default '[]' | Available model names |
| max_concurrent_requests | integer not null | Capacity guard |
| current_load | integer not null default 0 | Last known load |
| priority | integer not null default 100 | Lower number routes first |
| last_health_check_at | timestamptz | Last check |
| created_at | timestamptz not null | Creation time |
| updated_at | timestamptz not null | Update time |

Indexes:

- Index on `status`.
- Index on `priority`.

### model_requests

Tracks individual routed inference requests.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Request ID |
| user_id | uuid fk users(id) | Owner |
| conversation_id | uuid fk conversations(id) | Conversation |
| message_id | uuid fk messages(id) | Assistant message |
| model_server_id | uuid fk model_servers(id) | Routed server |
| model | text not null | Model name |
| status | text not null | `started`, `success`, `failed`, `canceled`, `timeout` |
| started_at | timestamptz not null | Start |
| completed_at | timestamptz | End |
| latency_ms | integer | Latency |
| error_code | text | Error |
| created_at | timestamptz not null | Creation time |

Indexes:

- Index on `(model_server_id, started_at desc)`.
- Index on `(user_id, started_at desc)`.
- Index on `status`.

### fair_use_policies

Configurable tier limits.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Policy ID |
| tier | text unique not null | `free` or `pro` |
| daily_message_limit | integer not null | Max messages per UTC or app-local day |
| monthly_message_limit | integer not null | Max messages per calendar month |
| daily_token_limit_est | integer | Optional token cap |
| monthly_token_limit_est | integer | Optional token cap |
| max_concurrent_generations | integer not null default 1 | Per-user concurrency |
| enabled | boolean not null default true | Active policy |
| created_at | timestamptz not null | Creation time |
| updated_at | timestamptz not null | Update time |

### stripe_events

Webhook idempotency ledger.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid pk | Internal event ID |
| stripe_event_id | text unique not null | Stripe event ID |
| event_type | text not null | Stripe event type |
| processed_at | timestamptz | Processing completion |
| processing_error | text | Error detail |
| payload | jsonb not null | Raw event payload |
| created_at | timestamptz not null | Receipt time |

## Redis Keys

### Usage Counters

```text
usage:{user_id}:daily:{yyyy-mm-dd}:messages
usage:{user_id}:monthly:{yyyy-mm}:messages
usage:{user_id}:daily:{yyyy-mm-dd}:tokens
usage:{user_id}:monthly:{yyyy-mm}:tokens
```

Counters should expire after a buffer period, for example 48 hours for daily keys and 45 days for monthly keys.

### Concurrency Locks

```text
generation:{user_id}:active
generation:{user_id}:{request_id}
```

Used to enforce per-user active generation limits and support cleanup after disconnects or timeouts.

### Model Server State

```text
model_server:{server_id}:health
model_server:{server_id}:inflight
model_server:{server_id}:cooldown_until
```

Used for fast routing decisions.

## Data Retention

MVP recommendation:

- Keep conversations until the user deletes them.
- Keep usage events for at least 12 months for billing analytics and abuse review.
- Keep Stripe event payloads for at least 90 days.
- Hard-delete messages only when account deletion is implemented and legally acceptable.

## Migration Strategy

- Use Alembic for FastAPI database migrations.
- All schema changes must be reviewed before production deployment.
- Seed local development with one free policy and one pro policy.
- Keep enum-like fields as text for MVP speed, then convert to database enums only if needed.
