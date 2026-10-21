/** 动作价格。1 次旧额度 = 1 积分，数字规则不变，只是改了叫法。 */
export const CREDIT_PRICES = {
  layout: 1,
  humanize: 1,
};

export function creditCost(action) {
  const cost = CREDIT_PRICES[action];
  if (!Number.isInteger(cost) || cost < 1) return null;
  return cost;
}
