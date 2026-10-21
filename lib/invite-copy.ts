/** 复制邀请码时贴出去的整段话。工作室的 app.js 用同一段。 */
export function inviteShareText(code: string): string {
  return `好文章值得好排版。\n一起来试：https://www.yoooco.com/\n邀请码：${code}\n好友注册成功后，双方各 +5 积分。`;
}
