import { z } from 'zod';
import { money } from './betting.js';

export const tierLevel = z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond']);
export type TierLevel = z.infer<typeof tierLevel>;

export const tier = z.object({
  customerId: z.string().min(1),
  level: tierLevel,
  cashbackPct: z.number().min(0).max(100).optional(),
  progress: z.number().min(0).max(1).optional(),
  managerHandle: z.string().optional(),
});
export type Tier = z.infer<typeof tier>;

export const benefit = z.object({
  benefitId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  minLevel: tierLevel.optional(),
});
export type Benefit = z.infer<typeof benefit>;

export const filedBy = z.object({
  kind: z.enum(['human', 'agent']),
  id: z.string().min(1),
});

export const limitKind = z.enum(['maxStakePerBet', 'maxStakePerMarket', 'dailyCap']);

export const createLimitRequest = z.object({
  kind: limitKind,
  requestedValue: money,
  reason: z.string().min(1).max(500),
  eventContext: z.string().max(200).optional(),
  expiresAt: z.string().datetime({ offset: true }).optional(),
  filedBy: filedBy.optional(),
});
export type CreateLimitRequest = z.infer<typeof createLimitRequest>;

export const limitRequestStatus = z.enum(['pending', 'approved', 'declined', 'expired']);

export const limitRequest = createLimitRequest.extend({
  requestId: z.string().min(1),
  customerId: z.string().min(1),
  status: limitRequestStatus,
  decidedBy: z.string().optional(),
  decidedAt: z.string().datetime({ offset: true }).optional(),
  createdAt: z.string().datetime({ offset: true }),
});
export type LimitRequest = z.infer<typeof limitRequest>;

export const createDeal = z.object({
  summary: z.string().min(1).max(200),
  terms: z.string().min(1).max(2000),
  eventContext: z.string().max(200).optional(),
  filedBy: filedBy.optional(),
});
export type CreateDeal = z.infer<typeof createDeal>;

export const deal = createDeal.extend({
  dealId: z.string().min(1),
  customerId: z.string().min(1),
  status: z.enum(['proposed', 'approved', 'declined', 'withdrawn']),
  decidedBy: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }),
});
export type Deal = z.infer<typeof deal>;
