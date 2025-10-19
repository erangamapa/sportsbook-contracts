import { z } from 'zod';

export const money = z.object({
  currency: z.string().min(2).max(10),
  amount: z.string().regex(/^\d+(\.\d{1,8})?$/),
});
export type Money = z.infer<typeof money>;

export const selection = z.object({
  eventId: z.string().min(1),
  marketId: z.string().min(1),
  selectionId: z.string().min(1),
  price: z.string().regex(/^\d+(\.\d{1,4})?$/),
});
export type Selection = z.infer<typeof selection>;

export const slipDraft = z.object({
  accountId: z.string().min(1),
  selections: z.array(selection).min(1).max(20),
  stake: money,
  mode: z.enum(['single', 'parlay']).default('single'),
});
export type SlipDraft = z.infer<typeof slipDraft>;

export const pricedSelection = selection.extend({
  status: z.enum(['active', 'suspended', 'settled']).optional(),
  repriced: z.boolean().optional(),
});

export const pricedSlip = z.object({
  slipId: z.string().min(1),
  selections: z.array(pricedSelection).min(1),
  stake: money,
  potentialReturn: money,
  valid: z.boolean(),
  rejections: z.array(z.string()).default([]),
});
export type PricedSlip = z.infer<typeof pricedSlip>;

export const actor = z.object({
  kind: z.enum(['player', 'agent']),
  id: z.string().min(1),
});
export type Actor = z.infer<typeof actor>;

export const placeBetRequest = z.object({
  slipId: z.string().min(1),
  stake: money,
  placedBy: actor,
  onBehalfOf: z.string().min(1).optional(),
  confirmationRef: z.string().min(1).optional(),
});
export type PlaceBetRequest = z.infer<typeof placeBetRequest>;

export const betStatus = z.enum(['pending', 'open', 'won', 'lost', 'void']);
export type BetStatus = z.infer<typeof betStatus>;

export const bet = z.object({
  betId: z.string().min(1),
  accountId: z.string().min(1),
  selections: z.array(selection).min(1),
  stake: money,
  potentialReturn: money.optional(),
  status: betStatus,
  placedBy: actor.optional(),
  createdAt: z.string().datetime({ offset: true }),
  settledAt: z.string().datetime({ offset: true }).optional(),
});
export type Bet = z.infer<typeof bet>;

export const accountLimits = z.object({
  accountId: z.string().min(1),
  maxStakePerBet: money,
  maxStakePerMarket: money.optional(),
  dailyCap: money,
  exposureCeiling: money.optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
});
export type AccountLimits = z.infer<typeof accountLimits>;
