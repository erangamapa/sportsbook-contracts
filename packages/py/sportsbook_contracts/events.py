"""Event payload models for the pub sub topics and the odds SSE stream."""
from __future__ import annotations

import re
from datetime import datetime
from typing import Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, Field, TypeAdapter, field_validator

from .models import Money

PRICE_RE = re.compile(r'^\d+(\.\d{1,4})?$')


class Base(BaseModel):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)


class NewsItem(Base):
    news_id: str = Field(alias='newsId', min_length=1)
    source: str = Field(min_length=1)
    author: Optional[str] = None
    text: str = Field(min_length=1, max_length=4000)
    url: Optional[str] = None
    published_at: datetime = Field(alias='publishedAt')
    dedupe_key: str = Field(alias='dedupeKey', min_length=1)
    sport_hint: Optional[str] = Field(alias='sportHint', default=None)


class SettlementEvent(Base):
    bet_id: str = Field(alias='betId', min_length=1)
    account_id: str = Field(alias='accountId', min_length=1)
    result: Literal['won', 'lost', 'void']
    payout: Optional[Money] = None
    settled_at: datetime = Field(alias='settledAt')


class PostCreated(Base):
    kind: Literal['post.created']
    post_id: str = Field(alias='postId', min_length=1)
    author_handle: str = Field(alias='authorHandle', min_length=1)
    author_kind: Literal['human', 'agent'] = Field(alias='authorKind')
    sport: Optional[str] = None
    bet_id: Optional[str] = Field(alias='betId', default=None)
    created_at: datetime = Field(alias='createdAt')


class ReplyCreated(Base):
    kind: Literal['reply.created']
    reply_id: str = Field(alias='replyId', min_length=1)
    post_id: str = Field(alias='postId', min_length=1)
    author_handle: str = Field(alias='authorHandle', min_length=1)
    author_kind: Literal['human', 'agent'] = Field(alias='authorKind')
    mentions: list[str] = Field(default_factory=list)
    created_at: datetime = Field(alias='createdAt')


class MentionCreated(Base):
    kind: Literal['mention.created']
    mentioned_handle: str = Field(alias='mentionedHandle', min_length=1)
    by_handle: str = Field(alias='byHandle', min_length=1)
    by_kind: Optional[Literal['human', 'agent']] = Field(alias='byKind', default=None)
    post_id: str = Field(alias='postId', min_length=1)
    reply_id: Optional[str] = Field(alias='replyId', default=None)
    created_at: datetime = Field(alias='createdAt')


class DmMessageCreated(Base):
    kind: Literal['dm.message.created']
    message_id: str = Field(alias='messageId', min_length=1)
    conversation_id: str = Field(alias='conversationId', min_length=1)
    from_handle: str = Field(alias='fromHandle', min_length=1)
    from_kind: Literal['human', 'agent'] = Field(alias='fromKind')
    has_bet_proposal: bool = Field(alias='hasBetProposal', default=False)
    created_at: datetime = Field(alias='createdAt')


FeedEvent = Union[PostCreated, ReplyCreated, MentionCreated, DmMessageCreated]
_feed_adapter: TypeAdapter[FeedEvent] = TypeAdapter(FeedEvent)


def parse_feed_event(payload: dict) -> FeedEvent:
    return _feed_adapter.validate_python(payload)


class OddsTick(Base):
    event_id: str = Field(alias='eventId', min_length=1)
    market_id: str = Field(alias='marketId', min_length=1)
    selection_id: str = Field(alias='selectionId', min_length=1)
    price: str
    status: Literal['active', 'suspended']
    seq: int = Field(ge=0)
    ts: datetime

    @field_validator('price')
    @classmethod
    def price_is_decimal_string(cls, v: str) -> str:
        if not PRICE_RE.match(v):
            raise ValueError('price must be a decimal string')
        return v
