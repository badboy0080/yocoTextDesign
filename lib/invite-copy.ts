/** 复制邀请码时贴出去的整段话。前三行是原来的介绍，最后一句说明双方各加次。工作室的 app.js 用同一段。 */
export function inviteShareText(code: string): string {
  return `好的文章就应该有好的排版！\n快来https://yoooco.com/一起体验排版的乐趣吧！\n邀请码：${code}\n好友注册成功后，双方各 +5 次。`;
}
