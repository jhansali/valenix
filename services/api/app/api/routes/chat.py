from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.api.deps import get_active_user
from app.db.models import User
from app.schemas.chat import ChatRequest
from app.services.chat_service import stream_chat_response

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def chat(
    payload: ChatRequest,
    user: User = Depends(get_active_user),
):
    return StreamingResponse(
        stream_chat_response(
            user.id,
            conversation_id=payload.conversationId,
            prompt=payload.message,
            model=payload.model,
        ),
        media_type="text/event-stream",
    )
