export function calcPenalty(debt: number, overdueDays: number): number {
  if (!Number.isInteger(overdueDays) || overdueDays < 0) {
    throw new Error('INVALID_DAYS');
  }
  if (!Number.isFinite(debt) || debt <= 0) {
    throw new Error('INVALID_DEBT');
  }
      if (overdueDays <= 3) return 0;
  return debt * 0.001 * (overdueDays - 3);
}