# Valenix MVP Requirements

## Product Vision

Valenix is a low-friction AI SaaS platform that gives users simple access to open-source AI models through a ChatGPT-style web interface.

The MVP goal is to launch quickly, validate demand, and learn whether users will pay for a lightweight unlimited-feeling AI product at a low monthly price.

## MVP Scope

### Included

- Google OAuth signup/login.
- Email and password signup/login.
- ChatGPT-style conversation interface.
- Minimal onboarding after first login.
- Free tier.
- $5/month Pro tier through Stripe.
- Open-source models served by dedicated Ollama model servers.
- Backend infrastructure node routes user requests to available model servers.
- Conversation and message persistence.
- Basic usage tracking.
- Basic fair-use controls.
- Basic admin visibility through database queries or internal-only scripts.
- Docker Compose-based local development.

### Excluded

- Retrieval-augmented generation.
- File uploads.
- Mobile app.
- Enterprise workspaces.
- SAML login.
- Teams, organizations, or seats.
- Fine-tuning.
- Custom user model selection beyond the models explicitly enabled for MVP.
- Public API access.
- Complex admin dashboard.
- Multi-region deployment.
- Advanced moderation pipeline.

## User Personas

### Free User

Wants quick access to an AI assistant without setup friction. May use Valenix occasionally and should understand the upgrade path when free-tier limits are reached.

### Pro User

Pays $5/month for higher fair-use limits, priority access, and a smoother experience. Expects the service to be available enough for everyday casual usage.

### Operator

Needs to monitor costs, usage, saturation, errors, and abusive behavior without building a large internal toolset.

## Core User Flows

### First Login With Google

1. User lands on the app.
2. User clicks "Continue with Google".
3. User completes Google OAuth.
4. App creates a user record if one does not exist.
5. User lands directly in a new chat.

### First Signup With Email And Password

1. User lands on the app.
2. User clicks "Sign up with email".
3. User enters email, password, and optional display name.
4. Backend validates the email and password requirements.
5. App creates a user record and password credential.
6. User lands directly in a new chat.

### Chat

1. User enters a prompt.
2. Frontend creates or uses an existing conversation.
3. Backend validates authentication, subscription tier, and fair-use allowance.
4. Backend routes the request to an available model server.
5. Backend streams the assistant response to the frontend.
6. Backend persists the user message, assistant message, token estimate, latency, and model metadata.

### Upgrade

1. Free user clicks upgrade.
2. Backend creates a Stripe Checkout Session.
3. User completes payment in Stripe.
4. Stripe webhook updates subscription status.
5. User receives Pro limits after webhook confirmation.

### Billing Management

1. Pro user opens billing settings.
2. Backend creates a Stripe Customer Portal session.
3. User manages subscription directly in Stripe.
4. Stripe webhook updates local subscription state.

## Functional Requirements

### Authentication

- Google OAuth and email/password are supported login methods.
- Users must have one application account per unique email address.
- Users who sign up with email/password should be able to later link the same email through Google OAuth if the provider email is verified.
- Passwords must be hashed with a modern password hashing algorithm.
- Plaintext passwords must never be stored or logged.
- Email/password login should use generic error messages that do not reveal whether an account exists.
- Sessions must be secure, HTTP-only where applicable, and expire predictably.
- The backend must not trust frontend-provided user identifiers.

### Chat

- Users can create conversations.
- Users can send messages in conversations they own.
- Users can view their conversation list.
- Users can view messages in a conversation.
- Users can rename and delete conversations.
- Assistant responses should stream to the client.
- Failed responses should preserve the user message and mark the assistant response as failed or absent.

### Billing

- Free tier is the default.
- Pro tier costs $5/month.
- Stripe is the source of truth for billing events.
- Local database stores the latest known subscription state for fast authorization.
- Webhooks must be idempotent.

### Usage Tracking

- Track message count, approximate input tokens, approximate output tokens, model used, latency, and success/failure.
- Usage must be attributable to a user and billing period.
- Usage data must support fair-use enforcement and future analytics.

### Fair Use

- Free users receive stricter daily and monthly limits.
- Pro users receive higher limits but not truly unbounded infrastructure usage.
- Limits should be configurable without code changes.
- The system should degrade gracefully when model capacity is saturated.

### Model Routing

- Backend routes requests to Ollama model servers.
- Model servers should not be publicly accessible.
- Backend should support multiple model servers.
- Routing should consider health, capacity, model availability, and recent failures.

## Non-Functional Requirements

### Development Speed

- Use mainstream frameworks and simple service boundaries.
- Avoid premature microservices.
- Keep local development reproducible with Docker Compose.

### Reliability

- Chat requests should fail with actionable user-facing errors when capacity is unavailable.
- Webhooks should be retry-safe.
- Long-running requests should have timeouts.

### Security

- Store secrets only in environment variables or managed secret stores.
- Validate all authenticated actions server-side.
- Keep model servers private.
- Verify Stripe webhook signatures.
- Validate Google OAuth tokens through trusted libraries.
- Hash passwords server-side and enforce basic password requirements.

### Observability

- Log request IDs, user IDs, model server IDs, latency, errors, and Stripe event IDs.
- Expose basic health checks for frontend, backend, database, Redis, and model servers.
- Track model server saturation and failed generations.

## Missing Requirements To Resolve

- Exact free-tier daily and monthly limits.
- Exact Pro fair-use limits.
- Initial model choice, context window, and whether Pro gets a better model.
- Whether chat history counts toward fair-use every turn.
- Data retention policy for conversations.
- Account deletion requirements.
- Refund policy and subscription cancellation copy.
- Minimum acceptable uptime for MVP.
- Whether user prompts need moderation before generation.
- Whether model outputs need safety filtering.
- Whether users can export conversations.
- Whether deleted conversations are hard-deleted or soft-deleted.
- Whether Google Workspace accounts require any special handling.
- Whether email verification is required before chat access.
- Whether password reset is required for MVP launch or can be added immediately after launch.
- Support email or contact flow.

## Suggested MVP Decisions

- Free tier: 25 messages/day and 500 messages/month.
- Pro tier: 500 messages/day and 10,000 messages/month, with additional throttling during saturation.
- One default model at launch, for example `llama3.1:8b` or another model proven to run reliably on the selected hardware.
- Hard-delete conversations for MVP unless legal or support requirements require retention.
- No moderation pipeline at launch, but keep schema fields and service boundaries compatible with adding one later.
- Use Stripe Customer Portal instead of building custom billing screens.
- Require email verification for password-based accounts before billing actions, but allow immediate chat access if speed is prioritized.
- Include password reset in the MVP if email/password login is offered publicly.
