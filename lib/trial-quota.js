/** 未登录访客每天的免费积分。1 积分 = 以前的 1 次。服务端配额、订阅文案都以这里为准。 */
export const TRIAL_LIMIT = 3;

export const UPGRADE_PROMPT =
  `免费积分已用完（每天 ${TRIAL_LIMIT} 积分）。升级专业版：¥9.9/月 或 ¥59.9/年。`;
