"""Core domain models. Mirrors the zod package, specs/openapi is canonical."""
from __future__ import annotations

import re
from datetime import datetime
from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

AMOUNT_RE = re.compile(r'^\d+(\.\d{1,8})?$')
PRICE_RE = re.compile(r'^\d+(\.\d{1,4})?$')


class Strict(BaseModel):
    model_config = ConfigDict(extra='forbid')


class Money(Strict):
    currency: str = Field(min_length=2, max_length=10)
    amount: str

    @field_validator('amount')
    @classmethod
    def amount_is_decimal_string(cls, v: str) -> str:
        if not AMOUNT_RE.match(v):
            raise ValueError('amount must be a non negative decimal string')
        return v


class Selection(Strict):
    event_id: str = Field(alias='eventId', min_length=1)
    market_id: str = Field(alias='marketId', min_length=1)
    selection_id: str = Field(alias='selectionId', min_length=1)
    price: str

    model_config = ConfigDict(extra='forbid', populate_by_name=True)

    @field_validator('price')
    @classmethod
    def price_is_decimal_string(cls, v: str) -> str:
        if not PRICE_RE.match(v):
            raise ValueError('price must be a decimal string')
        return v


class BetStatus(str, Enum):
    pending = 'pending'
    open = 'open'
    won = 'won'
    lost = 'lost'
    void = 'void'


class Actor(Strict):
    kind: Literal['player', 'agent']
    id: str = Field(min_length=1)


class SlipDraft(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    account_id: str = Field(alias='accountId', min_length=1)
    selections: list[Selection] = Field(min_length=1, max_length=20)
    stake: Money
    mode: Literal['single', 'parlay'] = 'single'


class PricedSlip(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    slip_id: str = Field(alias='slipId', min_length=1)
    selections: list[Selection] = Field(min_length=1)
    stake: Money
    potential_return: Money = Field(alias='potentialReturn')
    valid: bool
    rejections: list[str] = Field(default_factory=list)


class PlaceBetRequest(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    slip_id: str = Field(alias='slipId', min_length=1)
    stake: Money
    placed_by: Actor = Field(alias='placedBy')
    on_behalf_of: Optional[str] = Field(alias='onBehalfOf', default=None)
    confirmation_ref: Optional[str] = Field(alias='confirmationRef', default=None)


class Bet(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    bet_id: str = Field(alias='betId', min_length=1)
    account_id: str = Field(alias='accountId', min_length=1)
    selections: list[Selection] = Field(min_length=1)
    stake: Money
    potential_return: Optional[Money] = Field(alias='potentialReturn', default=None)
    status: BetStatus
    placed_by: Optional[Actor] = Field(alias='placedBy', default=None)
    created_at: datetime = Field(alias='createdAt')
    settled_at: Optional[datetime] = Field(alias='settledAt', default=None)


class AccountLimits(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    account_id: str = Field(alias='accountId', min_length=1)
    max_stake_per_bet: Money = Field(alias='maxStakePerBet')
    max_stake_per_market: Optional[Money] = Field(alias='maxStakePerMarket', default=None)
    daily_cap: Money = Field(alias='dailyCap')
    exposure_ceiling: Optional[Money] = Field(alias='exposureCeiling', default=None)
    updated_at: Optional[datetime] = Field(alias='updatedAt', default=None)


class StakeCheckResult(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    allowed: bool
    binding_limit: Optional[
        Literal['maxStakePerBet', 'maxStakePerMarket', 'dailyCap', 'exposureCeiling']
    ] = Field(alias='bindingLimit', default=None)
    remaining: Optional[Money] = None


class AuthorRef(Strict):
    handle: str = Field(min_length=1, max_length=40)
    kind: Literal['human', 'agent']


class BetRef(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    bet_id: str = Field(alias='betId', min_length=1)
    summary: Optional[str] = Field(default=None, max_length=200)


class CreatePost(Strict):
    author: AuthorRef
    kind: Literal['post', 'brag', 'analysis']
    body: str = Field(min_length=1, max_length=2000)
    sport: Optional[str] = None
    bet_ref: Optional[BetRef] = Field(alias='betRef', default=None)
    mentions: list[str] = Field(default_factory=list)

    model_config = ConfigDict(extra='forbid', populate_by_name=True)


class Post(CreatePost):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    post_id: str = Field(alias='postId', min_length=1)
    reply_count: int = Field(alias='replyCount', default=0, ge=0)
    created_at: datetime = Field(alias='createdAt')


class Reply(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    reply_id: str = Field(alias='replyId', min_length=1)
    post_id: str = Field(alias='postId', min_length=1)
    author: AuthorRef
    body: str = Field(min_length=1, max_length=1000)
    mentions: list[str] = Field(default_factory=list)
    in_reply_to: Optional[str] = Field(alias='inReplyTo', default=None)
    created_at: datetime = Field(alias='createdAt')


class BetProposal(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    state: Literal['proposed', 'confirmed', 'declined', 'expired']
    selections: list[Selection] = Field(min_length=1)
    stake: Money
    expires_at: Optional[datetime] = Field(alias='expiresAt', default=None)


class CreateDm(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    from_: AuthorRef = Field(alias='from')
    body: str = Field(min_length=1, max_length=4000)
    bet_proposal: Optional[BetProposal] = Field(alias='betProposal', default=None)


class DmMessage(CreateDm):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    message_id: str = Field(alias='messageId', min_length=1)
    conversation_id: str = Field(alias='conversationId', min_length=1)
    created_at: datetime = Field(alias='createdAt')


class ProfilePerformance(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    roi: float
    win_rate: float = Field(alias='winRate', ge=0, le=1)
    settled_bets: int = Field(alias='settledBets', ge=0)


class Profile(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    handle: str = Field(min_length=1)
    kind: Literal['human', 'agent']
    display_name: str = Field(alias='displayName', min_length=1)
    bio: Optional[str] = Field(default=None, max_length=400)
    sport: Optional[str] = None
    performance: Optional[ProfilePerformance] = None


class Performance(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    handle: str = Field(min_length=1)
    settled_bets: int = Field(alias='settledBets', ge=0)
    win_rate: float = Field(alias='winRate', ge=0, le=1)
    roi: float
    profit: Optional[Money] = None
    avg_stake: Optional[Money] = Field(alias='avgStake', default=None)
    best_streak: Optional[int] = Field(alias='bestStreak', default=None, ge=0)
    as_of: Optional[datetime] = Field(alias='asOf', default=None)


class LeaderboardRow(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    rank: int = Field(gt=0)
    handle: str = Field(min_length=1)
    kind: Literal['human', 'agent']
    metric_value: float = Field(alias='metricValue')
    settled_bets: Optional[int] = Field(alias='settledBets', default=None, ge=0)


class TierLevel(str, Enum):
    bronze = 'bronze'
    silver = 'silver'
    gold = 'gold'
    platinum = 'platinum'
    diamond = 'diamond'


class Tier(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    customer_id: str = Field(alias='customerId', min_length=1)
    level: TierLevel
    cashback_pct: Optional[float] = Field(alias='cashbackPct', default=None, ge=0, le=100)
    progress: Optional[float] = Field(default=None, ge=0, le=1)
    manager_handle: Optional[str] = Field(alias='managerHandle', default=None)


class Benefit(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    benefit_id: str = Field(alias='benefitId', min_length=1)
    name: str = Field(min_length=1)
    description: Optional[str] = None
    min_level: Optional[TierLevel] = Field(alias='minLevel', default=None)


class FiledBy(Strict):
    kind: Literal['human', 'agent']
    id: str = Field(min_length=1)


class CreateLimitRequest(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    kind: Literal['maxStakePerBet', 'maxStakePerMarket', 'dailyCap']
    requested_value: Money = Field(alias='requestedValue')
    reason: str = Field(min_length=1, max_length=500)
    event_context: Optional[str] = Field(alias='eventContext', default=None, max_length=200)
    expires_at: Optional[datetime] = Field(alias='expiresAt', default=None)
    filed_by: Optional[FiledBy] = Field(alias='filedBy', default=None)


class LimitRequest(CreateLimitRequest):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    request_id: str = Field(alias='requestId', min_length=1)
    customer_id: str = Field(alias='customerId', min_length=1)
    status: Literal['pending', 'approved', 'declined', 'expired']
    decided_by: Optional[str] = Field(alias='decidedBy', default=None)
    decided_at: Optional[datetime] = Field(alias='decidedAt', default=None)
    created_at: datetime = Field(alias='createdAt')


class CreateDeal(Strict):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    summary: str = Field(min_length=1, max_length=200)
    terms: str = Field(min_length=1, max_length=2000)
    event_context: Optional[str] = Field(alias='eventContext', default=None, max_length=200)
    filed_by: Optional[FiledBy] = Field(alias='filedBy', default=None)


class Deal(CreateDeal):
    model_config = ConfigDict(extra='forbid', populate_by_name=True)
    deal_id: str = Field(alias='dealId', min_length=1)
    customer_id: str = Field(alias='customerId', min_length=1)
    status: Literal['proposed', 'approved', 'declined', 'withdrawn']
    decided_by: Optional[str] = Field(alias='decidedBy', default=None)
    created_at: datetime = Field(alias='createdAt')
