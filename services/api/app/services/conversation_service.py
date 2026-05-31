from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import Conversation, Message, User


def conversation_to_summary(conversation: Conversation) -> dict:
    return {
        "id": str(conversation.id),
        "title": conversation.title,
        "model": conversation.model,
        "createdAt": conversation.created_at,
        "updatedAt": conversation.updated_at,
    }


def message_to_response(message: Message) -> dict:
    return {
        "id": str(message.id),
        "role": message.role,
        "content": message.content,
        "status": message.status,
        "createdAt": message.created_at,
    }


def conversation_to_detail(conversation: Conversation) -> dict:
    return {
        **conversation_to_summary(conversation),
        "messages": [message_to_response(message) for message in conversation.messages],
    }


async def list_conversations(db: AsyncSession, user: User) -> list[Conversation]:
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user.id)
        .order_by(Conversation.updated_at.desc())
        .limit(100)
    )
    return list(result.scalars().all())


async def create_conversation(
    db: AsyncSession, user: User, *, title: str = "New chat", model: str | None = None
) -> Conversation:
    conversation = Conversation(user_id=user.id, title=title or "New chat", model=model)
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation


async def get_conversation(db: AsyncSession, user: User, conversation_id: UUID) -> Conversation:
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation_id, Conversation.user_id == user.id)
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    return conversation

