from datetime import datetime

from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    status: str
    createdAt: datetime


class ConversationSummary(BaseModel):
    id: str
    title: str
    model: str | None
    createdAt: datetime
    updatedAt: datetime


class ConversationDetail(ConversationSummary):
    messages: list[MessageResponse]


class ConversationListResponse(BaseModel):
    items: list[ConversationSummary]
    nextCursor: str | None = None


class ConversationCreateRequest(BaseModel):
    title: str | None = Field(default="New chat", max_length=200)
    model: str | None = Field(default=None, max_length=100)


class ConversationUpdateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
