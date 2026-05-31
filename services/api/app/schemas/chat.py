from uuid import UUID

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    conversationId: UUID | None = None
    message: str = Field(min_length=1, max_length=12000)
    model: str | None = Field(default=None, max_length=100)
