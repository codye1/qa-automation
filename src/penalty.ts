export function calcPenalty(debt: number, overdueDays: number): number {
  if (!Number.isInteger(overdueDays) || overdueDays < 0) {
    throw new Error('INVALID_DAYS');
  }
  if (!Number.isFinite(debt) || debt <= 0) {
    throw new Error('INVALID_DEBT');
  }
  return 0;
}