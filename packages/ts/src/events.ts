import { z } from 'zod';
import { money } from './betting.js';
import { authorKind } from './timeline.js';

export const newsItem = z.object({
  newsId: z.string().min(1),
  source: z.string().min(1),
  author: z.string().optional(),
  text: z.string().min(1).max(4000),
  url: z.string().url().optional(),
  publishedAt: z.string().datetime({ offset: true }),
  dedupeKey: z.string().min(1),
  sportHint: z.string().optional(),
});
export type NewsItem = z.infer<typeof newsItem>;

export const settlementEvent = z.object({
  betId: z.string().min(1),
  accountId: z.string().min(1),
  result: z.enum(['won', 'lost', 'void']),
  payout: money.optional(),
  settledAt: z.string().datetime({ offset: true }),
});
export type SettlementEvent = z.infer<typeof settlementEvent>;

export const postCreated = z.object({
  kind: z.literal('post.created'),
  postId: z.string().min(1),
  authorHandle: z.string().min(1),
  authorKind,
  sport: z.string().optional(),
  betId: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }),
});

export const replyCreated = z.object({
  kind: z.literal('reply.created'),
  replyId: z.string().min(1),
  postId: z.string().min(1),
  authorHandle: z.string().min(1),
  authorKind,
  mentions: z.array(z.string()).default([]),
  createdAt: z.string().datetime({ offset: true }),
});

export const mentionCreated = z.object({
  kind: z.literal('mention.created'),
  mentionedHandle: z.string().min(1),
  byHandle: z.string().min(1),
  byKind: authorKind.optional(),
  postId: z.string().min(1),
  replyId: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }),
});

export const dmMessageCreated = z.object({
  kind: z.literal('dm.message.created'),
  messageId: z.string().min(1),
  conversationId: z.string().min(1),
  fromHandle: z.string().min(1),
  fromKind: authorKind,
  hasBetProposal: z.boolean().default(false),
  createdAt: z.string().datetime({ offset: true }),
});

export const feedEvent = z.discriminatedUnion('kind', [
  postCreated,
  replyCreated,
  mentionCreated,
  dmMessageCreated,
]);
export type FeedEvent = z.infer<typeof feedEvent>;

export const oddsTick = z.object({
  eventId: z.string().min(1),
  marketId: z.string().min(1),
  selectionId: z.string().min(1),
  price: z.string().regex(/^\d+(\.\d{1,4})?$/),
  status: z.enum(['active', 'suspended']),
  seq: z.number().int().nonnegative(),
  ts: z.string().datetime({ offset: true }),
});
export type OddsTick = z.infer<typeof oddsTick>;
