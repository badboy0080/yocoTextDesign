/** 访客每天的免费次数用完之后，再扣账号上的邀请加成。 */

export function quotaRemaining(dayCount: number, dailyLimit: number, bonus: number): number {
  const dailyLeft = Math.max(0, dailyLimit - Math.max(0, dayCount));
  const bonusLeft = Math.max(0, Math.floor(bonus));
  return dailyLeft + bonusLeft;
}

export function planNormalizeSpend(
  dayCount: number,
  dailyLimit: number,
  bonus: number,
): { action: "daily" | "bonus" | "exhausted"; remaining: number; bonus: number } {
  const dailyLeft = Math.max(0, dailyLimit - Math.max(0, dayCount));
  const bonusLeft = Math.max(0, Math.floor(bonus));
  if (dailyLeft > 0) {
    return { action: "daily", remaining: dailyLeft - 1 + bonusLeft, bonus: bonusLeft };
  }
  if (bonusLeft > 0) {
    return { action: "bonus", remaining: bonusLeft - 1, bonus: bonusLeft - 1 };
  }
  return { action: "exhausted", remaining: 0, bonus: 0 };
}
