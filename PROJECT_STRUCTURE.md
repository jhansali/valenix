# Valenix MVP Project Structure

## Repository Strategy

Use a monorepo for MVP speed. Keep the frontend, backend, infrastructure, and shared documentation in one repository. Avoid package-level complexity until there are enough engineers or deployment needs to justify it.

## Proposed Structure

```text
valenix/
  README.md
  REQUIREMENTS.md
  ARCHITECTURE.md
  DATABASE.md
  API_SPEC.md
  PROJECT_STRUCTURE.md
  DEPLOYMENT.md
  docker-compose.yml
  docker-compose.prod.yml
  .env.example
  .gitignore

  apps/
    web/
      package.json
      next.config.ts
      tsconfig.json
      tailwind.config.ts
      postcss.config.js
      src/
        app/
          page.tsx
          login/
            page.tsx
          signup/
            page.tsx
          forgot-password/
            page.tsx
          reset-password/
            page.tsx
          chat/
            page.tsx
          chat/
            [conversationId]/
              page.tsx
          settings/
            page.tsx
          settings/
            billing/
              page.tsx
        components/
          chat/
          layout/
          billing/
          auth/
          ui/
        lib/
          api-client.ts
          auth.ts
          config.ts
          streaming.ts
        styles/
          globals.css
        types/
          api.ts

  services/
    api/
      pyproject.toml
      alembic.ini
      Dockerfile
      app/
        main.py
        core/
          config.py
          logging.py
          security.py
          errors.py
        api/
          deps.py
          routes/
            auth.py
            conversations.py
            chat.py
            usage.py
            billing.py
            webhooks.py
            health.py
            internal_model_servers.py
        db/
          session.py
          base.py
          models/
            user.py
            oauth_account.py
            password_credential.py
            email_verification_token.py
            password_reset_token.py
            subscription.py
            conversation.py
            message.py
            usage_event.py
            model_server.py
            model_request.py
            fair_use_policy.py
            stripe_event.py
          migrations/
        schemas/
          auth.py
          conversation.py
          chat.py
          usage.py
          billing.py
        services/
          auth_service.py
          billing_service.py
          chat_service.py
          conversation_service.py
          fair_use_service.py
          model_router.py
          ollama_client.py
          usage_service.py
          stripe_webhook_service.py
        workers/
          health_checks.py
        tests/
          unit/
          integration/

  infra/
    nginx/
      nginx.conf
    postgres/
      init.sql
    redis/
      redis.conf
    ollama/
      README.md
    scripts/
      dev-up.sh
      dev-down.sh
      migrate.sh
      seed.sh

  docs/
    decisions/
      0001-monorepo.md
      0002-ollama-routing.md
```

## Frontend Route Plan

### Public Routes

- `/`: Landing page with Google login, email signup, and concise product positioning.
- `/login`: Email/password login and Google login.
- `/signup`: Email/password signup and Google signup.
- `/forgot-password`: Password reset request.
- `/reset-password`: Password reset completion.

### Authenticated Routes

- `/chat`: New chat screen.
- `/chat/[conversationId]`: Existing conversation.
- `/settings`: Account settings.
- `/settings/billing`: Subscription and billing management.

### Minimal Onboarding

Avoid a multi-step onboarding flow. On first login, show the chat UI immediately. Optional lightweight prompts can be shown inline:

- Display name from Google or email signup.
- Current tier.
- Upgrade button.
- Usage remaining.

## Frontend Component Boundaries

- `components/chat`: message list, composer, streaming response, conversation sidebar.
- `components/billing`: plan badge, upgrade button, portal button, subscription status.
- `components/auth`: Google login button, email/password forms, password reset forms, session guard.
- `components/layout`: app shell, sidebar, top bar.
- `components/ui`: reusable primitives.

## Backend Module Boundaries

### API Routes

Routes should be thin. They parse input, call services, and return schemas.

### Services

Business logic belongs in service modules:

- `chat_service`: request orchestration and streaming.
- `model_router`: model server selection and backpressure.
- `ollama_client`: Ollama HTTP integration.
- `fair_use_service`: limits and counters.
- `usage_service`: usage event recording.
- `billing_service`: Stripe Checkout and Portal.
- `stripe_webhook_service`: webhook processing.

### Database Models

SQLAlchemy models should stay close to schema definitions. Avoid mixing business logic into ORM classes.

## Testing Structure

### Frontend

- Component tests for chat UI state transitions.
- API client tests.
- End-to-end smoke test for login stub, chat, and billing link in local mode.

### Backend

- Unit tests for fair-use decisions.
- Unit tests for model routing.
- Unit tests for Stripe webhook idempotency.
- Integration tests for conversation and message APIs.
- Integration tests for streaming chat using a fake Ollama server.

## Environment Files

Use `.env.example` with non-secret placeholders:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_EMAIL_FROM=
EMAIL_PROVIDER_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
DATABASE_URL=postgresql+asyncpg://valenix:valenix@localhost:5432/valenix
REDIS_URL=redis://localhost:6379/0
SESSION_SECRET=
```

## Code Quality Standards

- TypeScript strict mode for frontend.
- Python type hints for backend service code.
- Formatting through Prettier, Ruff, and Black.
- Alembic migrations for all database changes.
- No direct frontend access to model servers.
- No billing access changes outside Stripe webhook and reconciliation logic.
