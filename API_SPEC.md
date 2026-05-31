# Valenix MVP API Specification

## API Style

- FastAPI serves JSON REST endpoints and streaming chat endpoints.
- Frontend calls the backend over HTTPS.
- All authenticated endpoints require a valid session or bearer token issued after Google OAuth or email/password login.
- API responses include stable error codes.
- MVP version prefix: `/api/v1`.

## Common Errors

| HTTP | Code | Meaning |
| --- | --- | --- |
| 400 | `bad_request` | Invalid request body or parameters |
| 401 | `unauthorized` | Missing or invalid authentication |
| 403 | `forbidden` | User lacks access to resource |
| 404 | `not_found` | Resource does not exist or is not visible to user |
| 409 | `conflict` | Idempotency or state conflict |
| 429 | `rate_limited` | Fair-use or concurrency limit reached |
| 503 | `model_capacity_unavailable` | No model server is currently available |
| 500 | `internal_error` | Unexpected server error |

## Authentication Endpoints

### POST `/api/v1/auth/signup`

Creates an account with email and password.

Request:

```json
{
  "email": "user@example.com",
  "password": "correct horse battery staple",
  "name": "Jane User"
}
```

Response:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane User",
  "tier": "free",
  "emailVerified": false
}
```

### POST `/api/v1/auth/login`

Authenticates an email/password user and creates a session.

Request:

```json
{
  "email": "user@example.com",
  "password": "correct horse battery staple"
}
```

Response:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane User",
  "tier": "free"
}
```

### GET `/api/v1/auth/google/start`

Starts Google OAuth login.

Response:

```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### GET `/api/v1/auth/google/callback`

Handles the Google OAuth callback, links or creates the user, and establishes a session.

### GET `/api/v1/auth/me`

Returns the current user.

Response:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane User",
  "avatarUrl": "https://...",
  "tier": "free",
  "authProviders": ["google", "password"],
  "emailVerified": true,
  "subscriptionStatus": "none"
}
```

### POST `/api/v1/auth/password/forgot`

Requests a password reset email. The response must be generic whether or not the email exists.

Request:

```json
{
  "email": "user@example.com"
}
```

Response:

```json
{ "ok": true }
```

### POST `/api/v1/auth/password/reset`

Resets a password using a valid reset token.

Request:

```json
{
  "token": "reset-token",
  "password": "new correct horse battery staple"
}
```

Response:

```json
{ "ok": true }
```

### POST `/api/v1/auth/email/verify`

Verifies an email address using a valid verification token.

Request:

```json
{
  "token": "verification-token"
}
```

Response:

```json
{ "ok": true }
```

### POST `/api/v1/auth/logout`

Ends the current session.

Response:

```json
{ "ok": true }
```

## Conversation Endpoints

### GET `/api/v1/conversations`

Returns the user's conversations.

Query parameters:

- `limit`: optional, default `30`, max `100`.
- `cursor`: optional pagination cursor.

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Conversation title",
      "model": "llama3.1:8b",
      "createdAt": "2026-05-31T12:00:00Z",
      "updatedAt": "2026-05-31T12:00:00Z"
    }
  ],
  "nextCursor": null
}
```

### POST `/api/v1/conversations`

Creates a conversation.

Request:

```json
{
  "title": "New chat",
  "model": "llama3.1:8b"
}
```

Response:

```json
{
  "id": "uuid",
  "title": "New chat",
  "model": "llama3.1:8b",
  "createdAt": "2026-05-31T12:00:00Z",
  "updatedAt": "2026-05-31T12:00:00Z"
}
```

### GET `/api/v1/conversations/{conversationId}`

Returns one conversation and its messages.

Response:

```json
{
  "id": "uuid",
  "title": "Conversation title",
  "model": "llama3.1:8b",
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Hello",
      "status": "complete",
      "createdAt": "2026-05-31T12:00:00Z"
    }
  ]
}
```

### PATCH `/api/v1/conversations/{conversationId}`

Updates conversation metadata.

Request:

```json
{
  "title": "Updated title"
}
```

Response:

```json
{ "ok": true }
```

### DELETE `/api/v1/conversations/{conversationId}`

Deletes or soft-deletes a conversation.

Response:

```json
{ "ok": true }
```

## Chat Endpoints

### POST `/api/v1/chat`

Creates a user message and streams an assistant response.

Request:

```json
{
  "conversationId": "uuid",
  "message": "Write a short email about...",
  "model": "llama3.1:8b"
}
```

Streaming response format should use Server-Sent Events for MVP simplicity.

Events:

```text
event: message_start
data: {"messageId":"uuid"}

event: token
data: {"text":"Hello"}

event: message_end
data: {"messageId":"uuid","usage":{"inputTokensEst":42,"outputTokensEst":128}}

event: error
data: {"code":"model_capacity_unavailable","message":"Model capacity is temporarily unavailable."}
```

Authorization and validation:

- User must own the conversation.
- User must be within fair-use limits.
- User must not exceed active generation concurrency.
- Model must be enabled for the user's tier.

### POST `/api/v1/chat/cancel`

Best-effort cancellation for an active generation.

Request:

```json
{
  "conversationId": "uuid",
  "messageId": "uuid"
}
```

Response:

```json
{ "ok": true }
```

## Usage Endpoints

### GET `/api/v1/usage/me`

Returns current usage and limits.

Response:

```json
{
  "tier": "free",
  "daily": {
    "messagesUsed": 8,
    "messagesLimit": 25,
    "tokensUsedEst": 12000,
    "tokensLimitEst": null
  },
  "monthly": {
    "messagesUsed": 120,
    "messagesLimit": 500,
    "tokensUsedEst": 240000,
    "tokensLimitEst": null
  }
}
```

## Billing Endpoints

### POST `/api/v1/billing/checkout`

Creates a Stripe Checkout Session for the Pro plan.

Request:

```json
{
  "successUrl": "https://app.valenix.ai/settings/billing?success=true",
  "cancelUrl": "https://app.valenix.ai/settings/billing?canceled=true"
}
```

Response:

```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### POST `/api/v1/billing/portal`

Creates a Stripe Customer Portal session.

Request:

```json
{
  "returnUrl": "https://app.valenix.ai/settings/billing"
}
```

Response:

```json
{
  "url": "https://billing.stripe.com/..."
}
```

### GET `/api/v1/billing/subscription`

Returns current subscription state.

Response:

```json
{
  "tier": "pro",
  "status": "active",
  "currentPeriodEnd": "2026-06-30T12:00:00Z",
  "cancelAtPeriodEnd": false
}
```

### POST `/api/v1/webhooks/stripe`

Receives Stripe webhooks.

Requirements:

- Verify `Stripe-Signature`.
- Store event ID before processing.
- Ignore duplicate event IDs.
- Process subscription and checkout events idempotently.

Important events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Model Operations Endpoints

These should be protected by an internal admin token or private network restrictions.

### GET `/api/v1/internal/model-servers`

Returns registered model servers and health state.

### POST `/api/v1/internal/model-servers/{serverId}/health`

Allows health check jobs or infrastructure to update server health.

## Health Endpoints

### GET `/healthz`

Lightweight process health check.

Response:

```json
{ "ok": true }
```

### GET `/readyz`

Readiness check that verifies database and Redis connectivity.

Response:

```json
{
  "ok": true,
  "postgres": "ok",
  "redis": "ok"
}
```
