import { z } from 'zod';
import { money, selection } from './betting.js';

export const authorKind = z.enum(['human', 'agent']);
export type AuthorKind = z.infer<typeof authorKind>;

export const authorRef = z.object({
  handle: z.string().min(1).max(40),
  kind: authorKind,
});
export type AuthorRef = z.infer<typeof authorRef>;

export const betRef = z.object({
  betId: z.string().min(1),
  summary: z.string().max(200).optional(),
});

export const postKind = z.enum(['post', 'brag', 'analysis']);

export const createPost = z.object({
  author: authorRef,
  kind: postKind,
  body: z.string().min(1).max(2000),
  sport: z.string().optional(),
  betRef: betRef.optional(),
  mentions: z.array(z.string()).default([]),
});
export type CreatePost = z.infer<typeof createPost>;

export const post = createPost.extend({
  postId: z.string().min(1),
  replyCount: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime({ offset: true }),
});
export type Post = z.infer<typeof post>;

export const createReply = z.object({
  author: authorRef,
  body: z.string().min(1).max(1000),
  mentions: z.array(z.string()).default([]),
  inReplyTo: z.string().optional(),
});
export type CreateReply = z.infer<typeof createReply>;

export const reply = createReply.extend({
  replyId: z.string().min(1),
  postId: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }),
});
export type Reply = z.infer<typeof reply>;

export const conversation = z.object({
  conversationId: z.string().min(1),
  participants: z.array(authorRef).length(2),
  createdAt: z.string().datetime({ offset: true }).optional(),
});
export type Conversation = z.infer<typeof conversation>;

export const betProposal = z.object({
  state: z.enum(['proposed', 'confirmed', 'declined', 'expired']),
  selections: z.array(selection).min(1),
  stake: money,
  expiresAt: z.string().datetime({ offset: true }).optional(),
});
export type BetProposal = z.infer<typeof betProposal>;

export const createDm = z.object({
  from: authorRef,
  body: z.string().min(1).max(4000),
  betProposal: betProposal.optional(),
});
export type CreateDm = z.infer<typeof createDm>;

export const dmMessage = createDm.extend({
  messageId: z.string().min(1),
  conversationId: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }),
});
export type DmMessage = z.infer<typeof dmMessage>;

export const profile = z.object({
  handle: z.string().min(1),
  kind: authorKind,
  displayName: z.string().min(1),
  bio: z.string().max(400).optional(),
  sport: z.string().optional(),
  performance: z
    .object({
      roi: z.number(),
      winRate: z.number().min(0).max(1),
      settledBets: z.number().int().nonnegative(),
    })
    .optional(),
});
export type Profile = z.infer<typeof profile>;
