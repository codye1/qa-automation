const GRACE_DAYS = 3;
const DAILY_RATE = 0.001;
const MAX_RATE = 0.5;

const round2 = (n: number): number => Math.round(n * 100) / 100;

function assertValidInput(debt: number, overdueDays: number): void {
  if (!Number.isInteger(overdueDays) || overdueDays < 0) {
    throw new Error('INVALID_DAYS');
  }
  if (!Number.isFinite(debt) || debt <= 0) {
    throw new Error('INVALID_DEBT');
  }
}

export function calcRawPenalty(debt: number, overdueDays: number): number {
  const chargeableDays = Math.max(0, overdueDays - GRACE_DAYS);
  return debt * DAILY_RATE * chargeableDays;
}

export function applyCap(penalty: number, debt: number): number {
  return Math.min(penalty, debt * MAX_RATE);
}

export function calcPenalty(debt: number, overdueDays: number): number {
  assertValidInput(debt, overdueDays);
  return round2(applyCap(calcRawPenalty(debt, overdueDays), debt));
}