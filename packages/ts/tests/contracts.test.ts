import { describe, expect, it } from 'vitest';
import {
  accountLimits,
  bet,
  betProposal,
  createLimitRequest,
  createPost,
  dmMessage,
  feedEvent,
  limitRequest,
  money,
  newsItem,
  oddsTick,
  performance,
  placeBetRequest,
  pricedSlip,
  profile,
  reply,
  settlementEvent,
  slipDraft,
} from '../src/index.js';
import {
  betFixture,
  dmWithProposalFixture,
  limitRequestFixture,
  newsFixture,
  oddsTickFixture,
  performanceFixture,
  postFixture,
  replyFixture,
  settlementFixture,
  slipFixture,
} from './fixtures.js';

describe('money', () => {
  it('accepts decimal strings', () => {
    expect(money.parse({ currency: 'USDT', amount: '25.00' }).amount).toBe('25.00');
  });
  it('rejects floats and negatives', () => {
    expect(money.safeParse({ currency: 'USDT', amount: 25 }).success).toBe(false);
    expect(money.safeParse({ currency: 'USDT', amount: '-5' }).success).toBe(false);
  });
});

describe('betting', () => {
  it('parses a slip draft and defaults mode to single', () => {
    const parsed = slipDraft.parse(slipFixture);
    expect(parsed.mode).toBe('single');
  });
  it('caps parlay legs at twenty', () => {
    const legs = Array.from({ length: 21 }, (unused, i) => ({
      eventId: `e${i}`,
      marketId: 'm1',
      selectionId: 's1',
      price: '1.90',
    }));
    expect(slipDraft.safeParse({ ...slipFixture, selections: legs }).success).toBe(false);
  });
  it('round trips a bet', () => {
    expect(bet.parse(betFixture).status).toBe('open');
  });
  it('requires an actor on placement', () => {
    const bad = { slipId: 'slip1', stake: { currency: 'USDT', amount: '10' } };
    expect(placeBetRequest.safeParse(bad).success).toBe(false);
  });
  it('rejects a priced slip without validity flag', () => {
    const draft: Record<string, unknown> = { ...slipFixture, slipId: 'x', potentialReturn: slipFixture.stake };
    expect(pricedSlip.safeParse(draft).success).toBe(false);
  });
  it('parses account limits', () => {
    const parsed = accountLimits.parse({
      accountId: 'a1',
      maxStakePerBet: { currency: 'USDT', amount: '500' },
      dailyCap: { currency: 'USDT', amount: '2000' },
    });
    expect(parsed.maxStakePerMarket).toBeUndefined();
  });
});

describe('timeline', () => {
  it('parses posts and replies with mentions', () => {
    expect(createPost.parse(postFixture).mentions).toContain('courtside_ai');
    expect(reply.parse(replyFixture).postId).toBe('p1');
  });
  it('parses a dm with a bet proposal', () => {
    const parsed = dmMessage.parse(dmWithProposalFixture);
    expect(parsed.betProposal?.state).toBe('proposed');
  });
  it('rejects a proposal without selections', () => {
    const bad = { ...dmWithProposalFixture.betProposal, selections: [] };
    expect(betProposal.safeParse(bad).success).toBe(false);
  });
  it('bounds winRate on profiles', () => {
    const bad = {
      handle: 'x',
      kind: 'agent',
      displayName: 'X',
      performance: { roi: 0.1, winRate: 1.2, settledBets: 10 },
    };
    expect(profile.safeParse(bad).success).toBe(false);
  });
});

describe('stats and vip', () => {
  it('parses performance', () => {
    expect(performance.parse(performanceFixture).roi).toBeCloseTo(0.08);
  });
  it('parses a limit request lifecycle', () => {
    const parsed = limitRequest.parse(limitRequestFixture);
    expect(parsed.status).toBe('pending');
    expect(createLimitRequest.safeParse({ ...limitRequestFixture, reason: '' }).success).toBe(false);
  });
});

describe('events', () => {
  it('parses news, settlements and odds ticks', () => {
    expect(newsItem.parse(newsFixture).dedupeKey).toBeTruthy();
    expect(settlementEvent.parse(settlementFixture).result).toBe('won');
    expect(oddsTick.parse(oddsTickFixture).seq).toBe(412);
  });
  it('discriminates feed events on kind', () => {
    const parsed = feedEvent.parse({
      kind: 'mention.created',
      mentionedHandle: 'courtside_ai',
      byHandle: 'sharpsteve',
      postId: 'p1',
      createdAt: '2026-01-12T19:04:00+00:00',
    });
    expect(parsed.kind).toBe('mention.created');
  });
  it('rejects an unknown event kind', () => {
    expect(feedEvent.safeParse({ kind: 'post.deleted' }).success).toBe(false);
  });
});
