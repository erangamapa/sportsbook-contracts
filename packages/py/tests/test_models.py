import pytest
from pydantic import ValidationError

from sportsbook_contracts import (
    Bet,
    CreateLimitRequest,
    DmMessage,
    Money,
    NewsItem,
    OddsTick,
    Performance,
    SettlementEvent,
    SlipDraft,
    parse_feed_event,
)

SLIP = {
    'accountId': 'acct_19f3',
    'selections': [
        {'eventId': 'ev1', 'marketId': 'moneyline', 'selectionId': 'den', 'price': '1.95'}
    ],
    'stake': {'currency': 'USDT', 'amount': '25.00'},
}


def test_money_rejects_float_amounts():
    with pytest.raises(ValidationError):
        Money.model_validate({'currency': 'USDT', 'amount': 25.0})
    with pytest.raises(ValidationError):
        Money.model_validate({'currency': 'USDT', 'amount': '-5'})


def test_slip_draft_defaults_and_bounds():
    slip = SlipDraft.model_validate(SLIP)
    assert slip.mode == 'single'
    too_many = dict(SLIP, selections=[SLIP['selections'][0]] * 21)
    with pytest.raises(ValidationError):
        SlipDraft.model_validate(too_many)


def test_bet_round_trip_uses_aliases():
    bet = Bet.model_validate(
        {
            'betId': 'b1',
            'accountId': 'a1',
            'selections': SLIP['selections'],
            'stake': SLIP['stake'],
            'status': 'open',
            'createdAt': '2026-01-12T18:55:00+00:00',
        }
    )
    dumped = bet.model_dump(by_alias=True, exclude_none=True)
    assert dumped['betId'] == 'b1'
    assert dumped['status'] == 'open'


def test_strict_models_reject_unknown_fields():
    with pytest.raises(ValidationError):
        SlipDraft.model_validate(dict(SLIP, surprise=True))


def test_dm_with_proposal_parses():
    dm = DmMessage.model_validate(
        {
            'messageId': 'm1',
            'conversationId': 'c1',
            'from': {'handle': 'courtside_ai', 'kind': 'agent'},
            'body': 'confirm and I will send it for placement',
            'betProposal': {
                'state': 'proposed',
                'selections': SLIP['selections'],
                'stake': SLIP['stake'],
            },
            'createdAt': '2026-01-12T19:05:00+00:00',
        }
    )
    assert dm.bet_proposal is not None
    assert dm.bet_proposal.state == 'proposed'


def test_performance_bounds():
    with pytest.raises(ValidationError):
        Performance.model_validate(
            {'handle': 'x', 'settledBets': 10, 'winRate': 1.2, 'roi': 0.1}
        )


def test_limit_request_requires_reason():
    with pytest.raises(ValidationError):
        CreateLimitRequest.model_validate(
            {
                'kind': 'maxStakePerBet',
                'requestedValue': {'currency': 'USDT', 'amount': '25000'},
                'reason': '',
            }
        )


def test_feed_event_discrimination():
    event = parse_feed_event(
        {
            'kind': 'mention.created',
            'mentionedHandle': 'courtside_ai',
            'byHandle': 'sharpsteve',
            'postId': 'p1',
            'createdAt': '2026-01-12T19:04:00+00:00',
        }
    )
    assert event.kind == 'mention.created'
    with pytest.raises(ValidationError):
        parse_feed_event({'kind': 'post.deleted'})


def test_event_payloads():
    news = NewsItem.model_validate(
        {
            'newsId': 'n1',
            'source': 'x_filtered_stream',
            'text': 'star player out tonight',
            'publishedAt': '2026-01-12T18:41:00+00:00',
            'dedupeKey': 'mh_1',
        }
    )
    assert news.sport_hint is None
    settlement = SettlementEvent.model_validate(
        {
            'betId': 'b1',
            'accountId': 'a1',
            'result': 'won',
            'settledAt': '2026-01-13T05:10:00+00:00',
        }
    )
    assert settlement.result == 'won'
    tick = OddsTick.model_validate(
        {
            'eventId': 'e1',
            'marketId': 'total',
            'selectionId': 'u224',
            'price': '1.88',
            'status': 'active',
            'seq': 412,
            'ts': '2026-01-12T19:06:30+00:00',
        }
    )
    assert tick.seq == 412
    with pytest.raises(ValidationError):
        OddsTick.model_validate(
            {
                'eventId': 'e1',
                'marketId': 'total',
                'selectionId': 'u224',
                'price': 'abc',
                'status': 'active',
                'seq': 1,
                'ts': '2026-01-12T19:06:30+00:00',
            }
        )
