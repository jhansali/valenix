from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_active_user
from app.db.models import User
from app.db.session import get_db
from app.schemas.conversation import (
    ConversationCreateRequest,
    ConversationDetail,
    ConversationListResponse,
    ConversationSummary,
    ConversationUpdateRequest,
)
from app.services.conversation_service import (
    conversation_to_detail,
    conversation_to_summary,
    create_conversation,
    get_conversation,
    list_conversations,
)

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=ConversationListResponse)
async def index(db: AsyncSession = Depends(get_db), user: User = Depends(get_active_user)):
    conversations = await list_conversations(db, user)
    return {
        "items": [conversation_to_summary(conversation) for conversation in conversations],
        "nextCursor": None,
    }


@router.post("", response_model=ConversationSummary)
async def create(
    payload: ConversationCreateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_active_user),
):
    conversation = await create_conversation(
        db, user, title=payload.title or "New chat", model=payload.model
    )
    return conversation_to_summary(conversation)


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def show(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_active_user),
):
    conversation = await get_conversation(db, user, conversation_id)
    return conversation_to_detail(conversation)


@router.patch("/{conversation_id}")
async def update(
    conversation_id: UUID,
    payload: ConversationUpdateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_active_user),
):
    conversation = await get_conversation(db, user, conversation_id)
    conversation.title = payload.title
    await db.commit()
    return {"ok": True}


@router.delete("/{conversation_id}")
async def delete(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_active_user),
):
    conversation = await get_conversation(db, user, conversation_id)
    await db.delete(conversation)
    await db.commit()
    return {"ok": True}
