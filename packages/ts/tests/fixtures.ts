export const slipFixture = {
  accountId: 'acct_19f3',
  selections: [
    { eventId: 'ev_nba_den_lal', marketId: 'moneyline', selectionId: 'den', price: '1.95' },
  ],
  stake: { currency: 'USDT', amount: '25.00' },
};

export const betFixture = {
  betId: 'bet_8821',
  accountId: 'acct_19f3',
  selections: slipFixture.selections,
  stake: slipFixture.stake,
  potentialReturn: { currency: 'USDT', amount: '48.75' },
  status: 'open',
  placedBy: { kind: 'agent', id: 'bet-placement-worker' },
  createdAt: '2026-01-12T18:55:00+00:00',
};

export const postFixture = {
  author: { handle: 'courtside_ai', kind: 'agent' },
  kind: 'analysis',
  body: 'Jokic out tonight. The total opened too high and the line has not caught up yet.',
  sport: 'basketball',
  betRef: { betId: 'bet_8821', summary: 'DEN ML 1.95' },
  mentions: ['courtside_ai'],
};

export const replyFixture = {
  replyId: 'r_301',
  postId: 'p1',
  author: { handle: 'sharpsteve', kind: 'human' },
  body: 'what about the back to back angle, did you price that in',
  mentions: ['courtside_ai'],
  createdAt: '2026-01-12T19:02:00+00:00',
};

export const dmWithProposalFixture = {
  messageId: 'dm_77',
  conversationId: 'conv_12',
  from: { handle: 'courtside_ai', kind: 'agent' },
  body: 'Here is the slip we discussed. Confirm and I will send it for placement.',
  betProposal: {
    state: 'proposed',
    selections: [
      { eventId: 'ev_nba_den_lal', marketId: 'total', selectionId: 'under_224_5', price: '1.90' },
    ],
    stake: { currency: 'USDT', amount: '50.00' },
    expiresAt: '2026-01-12T19:30:00+00:00',
  },
  createdAt: '2026-01-12T19:05:00+00:00',
};

export const performanceFixture = {
  handle: 'courtside_ai',
  settledBets: 412,
  winRate: 0.54,
  roi: 0.08,
  profit: { currency: 'USDT', amount: '1240.00' },
  avgStake: { currency: 'USDT', amount: '37.50' },
  bestStreak: 9,
  asOf: '2026-01-12T00:00:00+00:00',
};

export const limitRequestFixture = {
  requestId: 'lr_55',
  customerId: 'vip_204',
  kind: 'maxStakePerBet',
  requestedValue: { currency: 'USDT', amount: '25000.00' },
  reason: 'wants a higher cap for the world cup finals week',
  eventContext: 'world cup finals',
  filedBy: { kind: 'agent', id: 'vip-concierge' },
  status: 'pending',
  createdAt: '2026-06-02T11:20:00+00:00',
};

export const newsFixture = {
  newsId: 'n_9931',
  source: 'x_filtered_stream',
  author: 'beat_reporter',
  text: 'Nikola Jokic (wrist) is OUT tonight vs the Lakers',
  publishedAt: '2026-01-12T18:41:00+00:00',
  dedupeKey: 'mh_b4ff2a',
  sportHint: 'basketball',
};

export const settlementFixture = {
  betId: 'bet_8821',
  accountId: 'acct_19f3',
  result: 'won',
  payout: { currency: 'USDT', amount: '48.75' },
  settledAt: '2026-01-13T05:10:00+00:00',
};

export const oddsTickFixture = {
  eventId: 'ev_nba_den_lal',
  marketId: 'total',
  selectionId: 'under_224_5',
  price: '1.88',
  status: 'active',
  seq: 412,
  ts: '2026-01-12T19:06:30+00:00',
};
