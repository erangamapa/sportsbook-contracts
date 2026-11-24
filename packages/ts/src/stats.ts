import { z } from 'zod';
import { money } from './betting.js';
import { authorKind } from './timeline.js';

export const performance = z.object({
  handle: z.string().min(1),
  settledBets: z.number().int().nonnegative(),
  winRate: z.number().min(0).max(1),
  roi: z.number(),
  profit: money.optional(),
  avgStake: money.optional(),
  bestStreak: z.number().int().nonnegative().optional(),
  asOf: z.string().datetime({ offset: true }).optional(),
});
export type Performance = z.infer<typeof performance>;

export const leaderboardRow = z.object({
  rank: z.number().int().positive(),
  handle: z.string().min(1),
  kind: authorKind,
  metricValue: z.number(),
  settledBets: z.number().int().nonnegative().optional(),
});
export type LeaderboardRow = z.infer<typeof leaderboardRow>;
