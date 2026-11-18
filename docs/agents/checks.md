# 本地检查

开 PR 前跑 `npm run check`。它按顺序做三件事：

1. `npm run lint`：现有的 eslint。
2. `npm run typecheck`：`tsc --noEmit --incremental false`。不写出编译结果。
3. `node scripts/run-checks.mjs`：下面这些脚本，每条单独开一个进程。

跑第 3 步时会把 `NODE_ENV` 设成 `development`，并拿掉 `PAGES_BLOB_DEPLOY_CREDENTIAL` 和 `PAGES_PROJECT_ID`。这样邀请、额度和账号检查在没有正式存储时用内存，也不会因为本机终端里留着凭证而去写正式站的存储。

## 纳入的脚本

这些都不需要真实账号、数据库、密钥或正式站。模型相关的脚本用假返回。

用 `node scripts/<文件名>` 跑 JavaScript，用 `npx tsx scripts/<文件名>` 跑 TypeScript。`tsx` 是现有安装里已经有的（`drizzle-kit` 带进来），这次没有新加包，也没有改 lock 文件。单独跑时会沿用你当前终端的环境变量，默认总命令不会。

| 脚本 | 在查什么 |
| --- | --- |
| `check-block-style.js` | 划词改字号、颜色和重点时，样式怎么写回 HTML |
| `check-emoji-theme.js` | 表情主题的图标数量、位置和分隔 |
| `check-highlight-marks.js` | 各主题的重点标记，以及模型没标时怎么补 |
| `check-humanize-empty.js` | 人味改写遇到空结果时怎么重试、怎么报错 |
| `check-mobile-layout.js` | 窄屏工作台能往下滚，复制稿尺寸不跟着屏幕变 |
| `check-normalize-timeout.js` | 没配排版密钥要马上说明；超时自己停，不拖成网关超时 |
| `check-preview-outline.js` | 预览左侧大纲的列表、定位，以及它不进复制稿 |
| `check-slash-cards.js` | 空行敲 `/` 插入的引用、重点、分割线、图文头和栅格 |
| `check-source-media.js` | 粘贴的图片和链接留在预览里，优化丢了会补回 |
| `check-texture-highlight-density.js` | 质感自动重点变少，原文标过的重点还在 |
| `check-texture-theme.js` | 质感的编号、金句、分隔、加粗和透明重点 |
| `check-account-admin.ts` | 后台权限、额度和邀请加成。账号是脚本里的假数据 |
| `check-invite.ts` | 邀请文案、常见问题，以及内存里的邀请码核销 |
| `check-known-accounts.ts` | 保底账号只在内存里补齐，不改别人的密码 |
| `check-layout-history.ts` | 排版历史的整理和隔离。脚本自己打开内存开关 |
| `check-otp.ts` | 验证码的发放、校验和邮件请求形状。用假密钥，网络返回也是假的 |
| `check-seo.ts` | 标题、说明、站点地图和落地页地址。只读仓库里的文件 |
| `check-session-cookie.ts` | 登录票在正式域名和本机上怎么写、怎么清 |
| `check-unlimited-uses.ts` | 不限次数不扣每日额度和邀请加成 |

## 没有整份排除的脚本

19 条检查脚本都放进了默认命令。没有一条必须连真实账号、数据库或正式站才能跑完。

会碰到存储代码、但没有凭证时自己改用内存的，是 `check-invite.ts`、`check-account-admin.ts`、`check-unlimited-uses.ts`。默认命令会先拿掉 Pages Blob 凭证。若要按当前终端的环境单独看它们会不会连上存储，直接跑 `npx tsx scripts/check-invite.ts` 这一类命令，不要走 `npm run check`。

## 修过的旧脚本

`check-mobile-layout.js` 原来写死 `app.js?v=mobile-fit-v1`。后来工作台脚本的缓存号改成了 `texture-plain-v1`，样式仍是 `mobile-fit-v1`，这条检查就误报。现在只确认页面仍给样式和脚本带了缓存号。窄屏能不能滚、复制稿尺寸有没有被改，仍按文件内容查。

## 现有 lint

`npm run lint` 仍会打出 9 条未使用变量的警告，在 `public/analytics.js`、`public/app.js`、`public/themes.js`。警告不会让命令失败。这次没有删这些函数。

master 上这条 lint 原来会失败。失败点不是这次的检查脚本测出来的产品回归，而是几处原有页面写法和一条误判：

- 眼睛动画在画的那一帧读最新参数。
- 常见问题挂载后再按地址栏锚点打开。
- 作品侧栏挂载后再读本机折叠记录。
- 统计页把地址栏里的口令填进输入框。
- 作品页 logo 仍是整页回到首页的链接。
- `useAccountReaderForTests` 只是检查脚本的替身，不是 React Hook。这条规则只在 `scripts/` 放开。

这几处页面行为没有改。`components/ui/dot-pattern.tsx` 里的 `any` 改成了数字和 SVG 属性，点阵样子不变。

## 这次没做的

仓库没有 `npm test`。这次没有加 GitHub Actions。
