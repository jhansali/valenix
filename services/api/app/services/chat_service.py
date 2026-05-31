import asyncio
import json
import time
from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from uuid import UUID

import httpx
from sqlalchemy import update

from app.core.config import settings
from app.db.models import Conversation, Message, User
from app.db.session import SessionLocal
from app.services.conversation_service import create_conversation, get_conversation


def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def estimate_tokens(text: str) -> int:
    return max(1, len(text.split()))


async def fallback_response(prompt: str) -> AsyncGenerator[str, None]:
    text = (
        "Valenix is running in local fallback mode. "
        "Your message was saved, and streaming is working. "
        f"You said: {prompt}"
    )
    for token in text.split(" "):
        await asyncio.sleep(0.035)
        yield token + " "


async def ollama_response(prompt: str, model: str) -> AsyncGenerator[str, None]:
    if not settings.ollama_base_url:
        async for chunk in fallback_response(prompt):
            yield chunk
        return

    payload = {"model": model, "prompt": prompt, "stream": True}
    timeout = httpx.Timeout(settings.ollama_timeout_seconds, connect=10.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream(
            "POST", f"{settings.ollama_base_url.rstrip('/')}/api/generate", json=payload
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line:
                    continue
                data = json.loads(line)
                if data.get("response"):
                    yield data["response"]
                if data.get("done"):
                    break


async def persist_assistant_message(
    *,
    assistant_message_id: UUID,
    conversation_id: UUID,
    status: str,
    content: str,
    latency_ms: int,
    output_tokens_est: int | None = None,
) -> None:
    now = datetime.now(UTC)
    message_values = {
        "content": content,
        "status": status,
        "latency_ms": latency_ms,
        "updated_at": now,
    }
    if output_tokens_est is not None:
        message_values["output_tokens_est"] = output_tokens_est

    async with SessionLocal() as db:
        await db.execute(
            update(Message).where(Message.id == assistant_message_id).values(**message_values)
        )
        await db.execute(
            update(Conversation).where(Conversation.id == conversation_id).values(updated_at=now)
        )
        await db.commit()


async def stream_chat_response(
    user_id: UUID,
    *,
    conversation_id: UUID | None,
    prompt: str,
    model: str | None,
) -> AsyncGenerator[str, None]:
    started_at = time.perf_counter()
    selected_model = model or settings.ollama_model

    async with SessionLocal() as db:
        user = User(id=user_id)
        if conversation_id:
            conversation = await get_conversation(db, user, conversation_id)
        else:
            conversation = await create_conversation(
                db, user, title=prompt[:60] or "New chat", model=selected_model
            )

        if conversation.title == "New chat":
            conversation.title = prompt[:60] or "New chat"

        now = datetime.now(UTC)
        conversation.updated_at = now
        user_message = Message(
            conversation_id=conversation.id,
            user_id=user_id,
            role="user",
            content=prompt,
            status="complete",
            model=selected_model,
            input_tokens_est=estimate_tokens(prompt),
        )
        assistant_message = Message(
            conversation_id=conversation.id,
            user_id=user_id,
            role="assistant",
            content="",
            status="streaming",
            model=selected_model,
        )
        db.add_all([user_message, assistant_message])
        await db.commit()
        await db.refresh(user_message)
        await db.refresh(assistant_message)

        conversation_id = conversation.id
        user_message_id = user_message.id
        assistant_message_id = assistant_message.id
        input_tokens_est = user_message.input_tokens_est

    yield sse(
        "message_start",
        {
            "conversationId": str(conversation_id),
            "userMessageId": str(user_message_id),
            "assistantMessageId": str(assistant_message_id),
        },
    )

    content_parts: list[str] = []
    try:
        async for text in ollama_response(prompt, selected_model):
            content_parts.append(text)
            yield sse("token", {"text": text})

        content = "".join(content_parts).strip()
        output_tokens_est = estimate_tokens(content)
        await persist_assistant_message(
            assistant_message_id=assistant_message_id,
            conversation_id=conversation_id,
            status="complete",
            content=content,
            latency_ms=int((time.perf_counter() - started_at) * 1000),
            output_tokens_est=output_tokens_est,
        )

        yield sse(
            "message_end",
            {
                "assistantMessageId": str(assistant_message_id),
                "usage": {
                    "inputTokensEst": input_tokens_est,
                    "outputTokensEst": output_tokens_est,
                },
            },
        )
    except asyncio.CancelledError:
        cleanup = asyncio.create_task(
            persist_assistant_message(
                assistant_message_id=assistant_message_id,
                conversation_id=conversation_id,
                status="cancelled",
                content="".join(content_parts).strip(),
                latency_ms=int((time.perf_counter() - started_at) * 1000),
            )
        )
        await asyncio.shield(cleanup)
        raise
    except Exception as exc:
        await persist_assistant_message(
            assistant_message_id=assistant_message_id,
            conversation_id=conversation_id,
            status="failed",
            content="".join(content_parts).strip(),
            latency_ms=int((time.perf_counter() - started_at) * 1000),
        )
        yield sse("error", {"code": "generation_failed", "message": str(exc)})
