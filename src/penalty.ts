const GRACE_DAYS = 3;
const DAILY_RATE = 0.001;
const MAX_RATE = 0.5;

export function calcPenalty(debt: number, overdueDays: number): number {
  if (!Number.isInteger(overdueDays) || overdueDays < 0) {
    throw new Error('INVALID_DAYS');
  }
  if (!Number.isFinite(debt) || debt <= 0) {
    throw new Error('INVALID_DEBT');
  }
  if (overdueDays <= GRACE_DAYS) return 0;

  const penalty = debt * DAILY_RATE * (overdueDays - GRACE_DAYS);
  return Math.min(penalty, debt * MAX_RATE);
}