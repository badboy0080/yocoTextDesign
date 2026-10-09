/** 未登录访客每天可免费优化的次数。服务端配额、订阅文案都以这里为准。 */
export const TRIAL_LIMIT = 3;

export const UPGRADE_PROMPT =
  `免费试用次数已用完（每天 ${TRIAL_LIMIT} 次）。升级专业版：¥9.9/月 或 ¥59.9/年。`;
