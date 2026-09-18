# 接手日志

## 当前接手摘要

产品：Yooco 双轨上线。增长首页改为干净 SaaS 落地页（大留白、少装饰）；主 CTA「免费试用 10 次」进工作室；价格三档与退款小字保留。已下线原稿/清氧绿对比图。已接最小漏斗：访问 → 试用点击 → 排版成功。

- **国内向（主推试）**：腾讯云 EdgeOne Makers 项目 `yooco`（ID `makers-x0xzxwaxcyxb`），加速区 global（含大陆）。预览域名形如 `https://yooco-ovsjwmib.edgeone.cool`，国内访问常需控制台「预览」带 `eo_token` 的链接（有时效）。DeepSeek 已配生产环境变量。构建：`npm run build:edgeone` → `edgeone makers deploy -n yooco -a global`。
- **海外备份**：Cloudflare `https://yooco.yooco-lab.workers.dev/`（国内多需代理）。工作室路径 `/studio` 与 `/studio.html` 都可用。
- **本地**：`npm run dev` → http://localhost:5173/ ；CTA 走 `/studio`（开发中间件改写到 `studio.html`）。
- **试用**：`POST /api/normalize` 免费 10 次/IP/天；工作室顶栏显示剩余次数；用尽提示专业版 ¥9.9/月、¥59.9/年（无真实支付）。EdgeOne 用 Blob，Cloudflare 用 Cache API。
- **漏斗**：`visit` / `trial_click` / `optimize_ok` 写入 EdgeOne Blob（失败不影响使用）。看数：`/metrics?token=`，口令为环境变量 `ANALYTICS_TOKEN`。
- **待办**：ICP 备案后把 `yooco.yokeaai.xyz` 绑到 EdgeOne；当前未改阿里云 DNS。部署时需在 EdgeOne 配 `ANALYTICS_TOKEN`。

## 最近 5 次工作记录

### 2026-09-18 首页改干净 SaaS 落地页

- 想做什么：对比图观感差，先拿掉；首页改成 Nextly 式大留白落地页，增长 CTA/价格/漏斗埋点不动。
- 做成了什么：去掉前后对比；hero + 三步 + 粘贴入口 + 价格 + 底部同一试用按钮；继续挂 analytics.js 和 trial_click。未改定价、未接支付、未加评价墙。
- 改了哪些文件：`app/home-landing.tsx`、`app/home.css`、删 `public/cases/wechat-before-after-01/*.png`、`handoff-log.md`。
- 如何验证：打开 `/` 应无对比图；可见绿色「免费试用 10 次」、价格三档、退款小字；点 CTA 进 `/studio`。
- 待办/风险：对比图以后有更好版本再加；粘贴框仍保留在主 CTA 下方较远位置，避免抢主按钮。

### 2026-09-18 最小漏斗统计

- 想做什么：增长能看 访问 → 试用 CTA 点击 → 排版成功。
- 做成了什么：三个事件；POST `/api/track`、GET `/api/metrics`（口令）、`/metrics` 页；首页和工作室埋点。未改定价、未接支付、未动试用门槛。
- 改了哪些文件：`lib/analytics-store.ts`、`app/api/track/route.ts`、`app/api/metrics/route.ts`、`app/metrics/*`、`public/analytics.js`、`app/home-landing.tsx`、`public/studio.html`、`public/app.js`、`lib/runtime-env.ts`、`vite.config.ts`、`handoff-log.md`。
- 如何验证：点绿色「免费试用 10 次」后 metrics 出现 trial_click；工作室优化成功出现 optimize_ok；`/metrics?token=` 能打开。
- 待办/风险：Blob 写失败会丢数但不挡用户；未配 `ANALYTICS_TOKEN` 时 `/api/metrics` 返回 503。

### 2026-09-18 首页嵌入前后对比图

- 想做什么：首页主句/试用 CTA 下方、价格区之前加原稿 vs 清氧绿对照。
- 做成了什么：左右并排（窄屏上下叠）；未遮挡「免费试用 10 次」；未接支付。
- 改了哪些文件：`app/home-landing.tsx`、`app/home.css`、`public/cases/wechat-before-after-01/`、`handoff-log.md`。
- 如何验证：打开 `/`，CTA 下方应看到左原稿、右清氧绿+本文脉络；再往下才是价格区。
- 待办/风险：无。

### 2026-09-18 增长首页文案 + 试用 10 次

- 想做什么：首页换成锁定增长文案；主按钮「免费试用 10 次」进工作室；AI 优化上限 10 次并显示剩余。
- 做成了什么：品牌统一 Yooco；主标题/副文案/价格/退款开票说明落地；`/studio` 在本地、Next、Workers 都能打开；normalize 用尽返回升级提示；工作室顶栏显示剩余次数。未做真实支付。
- 改了哪些文件：`app/home-landing.tsx`、`app/home.css`、`app/layout.tsx`、`app/api/normalize/route.ts`、`lib/edgeone-rate-limit.ts`、`public/studio.html`、`public/app.js`、`public/styles.css`、`next.config.ts`、`vite.config.ts`、`wrangler.jsonc`、`handoff-log.md`。
- 如何验证：`npm run build` / `npm run build:edgeone`；本地打开 `/` 点「免费试用 10 次」应到工作室；工作室可见「试用剩余 n 次」。
- 待办/风险：未接支付；次数按 IP 每天 10 次，清 localStorage 不能绕过线上配额。

### 2026-09-16 首页方案 C：shadcn 产品页重做

- 想做什么：按用户选 C，用 shadcn 整页重做首页。
- 做成了什么：去掉 Smart Text Lab 发光大标题与鼠标方格；Yooco 作主品牌；输入区用 Card/Textarea/Button/Alert；下方「三步发出去」；青绿强调色对齐清氧绿。
- 改了哪些文件：`app/home-landing.tsx`、`app/home.css`、`handoff-log.md`。
- 如何验证：`npm run dev` 打开 `/`，粘贴文字点「优化排版」应进工作室；上传 txt/docx；空提交有红色提示。
- 待办/风险：工作室页仍是旧 Dimensional 壳，首页与工作室视觉尚未统一。

### 2026-09-16 EdgeOne 免登录限流（中档）

- 想做什么：不上登录，控 DeepSeek 用量；只做 EdgeOne。
- 做成了什么：`POST /api/normalize` 按北京时间记次——同一 IP 每天 10 次、每分钟 2 次、全站每天 500 次；记在 EdgeOne Blob（`yooco-rate-limit`）。Cloudflare / 本地 Wrangler 因 `caches.default` 自动跳过。Blob 挂了则放行（不挡正常用）。
- 改了哪些文件：`lib/edgeone-rate-limit.ts`（新）、`app/api/normalize/route.ts`、`public/app.js`、`package.json`（`@edgeone/pages-blob`）、`handoff-log.md`。
- 如何验证：本地/Cloudflare 不限流；EdgeOne 已重新部署（`dpb2qme52j7s`）。
- 待办/风险：强一致仍可能并发少记 1 次；同一 Wi‑Fi 共用额度。Blob 若未自动建命名空间，第一次优化后看控制台「Blob 存储」。

### 2026-09-16 公众号重写：写完不等于发得出去

- 想做什么：按 wechat-writing + PM 博主人设，重写一篇讲 Yooco 的产品稿（与上一篇双钩子 Seed 长节区分）。
- 做成了什么：目录 `articles/yooco-last-mile/`：简报、证据、正文、6 张真截图、封面、质量分 82、公众号正文/预览 HTML；主轴「最后一公里」三决策；Seed 仅短边界。
- 改了哪些文件：`articles/yooco-last-mile/**`、`.baoyu-skills/baoyu-image-gen/EXTEND.md`、`handoff-log.md`。
- 如何验证：打开 `写完不等于发得出去_公众号预览.html`；线上 health 已复验 DeepSeek。
- 待办/风险：飞书需用户完成 device 授权后再 `docs +create`；发公众号前本地图换素材库。

### 2026-09-16 更新 wechat-writing：默认 PM 博主人设

- 想做什么：把「10年AI产品经理博主」第一人称改写规则写入 skill。
- 做成了什么：新增 `references/pm-blogger-voice.md`；`SKILL.md` / `persona-voice.md` / `quality-checklist.md` 已对齐。
- 改了哪些文件：wechat-writing skill 目录；`handoff-log.md`。
- 如何验证：下一篇 `/wechat-writing` 默认读 `pm-blogger-voice.md`。
- 待办/风险：其它机器 skill 副本需手动同步。

### 2026-09-16 公众号稿：拆100篇10万+做成 Yooco

- 想做什么：产品分享稿「分析了100篇10万+之后做了个工具」。
- 做成了什么：`articles/analyzed-100-viral/` 成稿约 80 分；含 Seed 0915 长节。
- 改了哪些文件：`articles/analyzed-100-viral/**`。
- 如何验证：预览 HTML；官方稿 https://mp.weixin.qq.com/s/Fp_mgF6wxMk0bkUVBqOKqA。
- 待办/风险：飞书待授权。

### 2026-09-16 EdgeOne Makers 适配并部署

- 想做什么：部署到 EdgeOne 便于国内访问。
- 做成了什么：runtime-env + edgeone 构建部署；DeepSeek 生产变量已配。
- 改了哪些文件：`lib/runtime-env.ts`、health/normalize、`db/index.ts`、`package.json`、`edgeone.json`。
- 如何验证：预览 URL `/api/health` → deepseekConfigured:true。
- 待办/风险：未备案依赖控制台预览链；绑域名需 ICP。

### 2026-09-16 Cloudflare Workers 免费上线

- 想做什么：部署到 `*.workers.dev`。
- 做成了什么：`https://yooco.yooco-lab.workers.dev/` 可用。
- 改了哪些文件：`wrangler.jsonc`。
- 如何验证：`/api/health` → deepseekConfigured:true。
- 待办/风险：国内常需代理。

### 2026-09-15 修复 studio.html 编码损坏

- 想做什么：用户反馈页面乱码/标签断裂；只需保留右键改类型。
- 做成了什么：从本地历史还原中文完好结构，按 Dimensional 壳重写 `studio.html`；右键菜单逻辑未动。
- 改了哪些文件：`public/studio.html`、`handoff-log.md`。
- 如何验证：`/studio.html` 中文正常。
- 待办：无。

### 2026-09-15 预览右键改文本类型

- 想做什么：在文章预览里右键改变文本块类型。
- 做成了什么：右键弹出「改为」菜单（6 种结构类型）。
- 改了哪些文件：`public/app.js`、`public/styles.css`、`public/studio.html`。
- 如何验证：预览正文右键。
- 待办：无。

### 归档：2026-09-15 首页工具栏「+」上传 txt/docx

- 想做什么：工具栏左侧加「+」，支持 .txt / .docx。
- 做成了什么：上传并写入输入框。
- 改了哪些文件：`app/home-landing.tsx`、`app/home.css`、`package.json`。
- 如何验证：首页「+」。
- 待办：其它格式后续。

### 归档：2026-09-15 首页标题字体 + Lab 青渐变 + 副文案

- 想做什么：改标题字体与 Lab 渐变；副文案改文案。
- 做成了什么：已落地。
- 改了哪些文件：`app/home-landing.tsx`、`app/home.css`。
- 如何验证：刷新 `/`。
- 待办：无。

### 2026-09-15 用 gzh-design 摸鱼绿排版体验稿

- 想做什么：用外部 skill gzh-design 的「摸鱼绿」把 `articles/yooco-lab-experience/article.md` 排成可粘公众号 HTML。
- 做成了什么：按官方工作流产出干净正文 + 带「复制到公众号」按钮的预览页；杂志封面/横滑目录/5 编号章节/金句卡/胶囊列表/2 深色代码块/5 张实测图/黄警告/三连区；官方校验 182 处 leaf、0 ERROR。注意：用的是外部 skill 原版摸鱼绿(#059669)，与 Yooco 内部 v19 改名后的「清氧绿」(#0A9D75) 无关。
- 改了哪些文件：新增 `article_排版_摸鱼绿(moyu-green).html` 与同名 `_预览.html`（均在文章目录）；未动产品代码。
- 如何验证：`validate_gzh_html.py` EXIT=0；临时 http.server:5199 打开预览页，5 张图 naturalWidth=784 全加载，快照含复制按钮与全部章节（验证完已关服务）。
- 待办/风险：①图为相对路径，发公众号前需在后台上传图床换 URL；②签名 `{{作者名}}/{{简介}}` 待替换；③按钮名按产品现状用「优化排版」；④未真实粘贴后台，建议本机贴一次确认。

### 2026-09-14 融合 gzh-design-skill 六套精选主题（v18，三阶段全部完成）

- 想做什么：参考开源项目 isjiamu/gzh-design-skill，把「摸鱼绿/红白/石墨极简/留白禅意/摸鱼票据/橄榄手记」6 套厚组件库并入：AI 先判主题+文章类型，面板可手动覆盖；旧 4 方向 11 皮肤保留为「经典」。
- 做成了什么：
  - 新增主题注册表 `public/themes.js`：6 主题设计变量（映射现有 state 键）+ 7 文章类型配方 + buildThemeState。
  - AI 契约 `lib/deepseek-normalizer.js`：加 theme/articleType/showSignature 枚举与默认值；系统提示词新增「第〇步」题材→主题决策表，组件 HTML 不进提示词。
  - 前端 `public/app.js`：applyTheme 切换、`data-gzh-theme` 盖层、AI 应用分支、自动目录（前 3 个二级标题，纯派生不写回）、可选结尾签名、`buildCopyHtml` 六主题内联版（引言卡/目录/签名/票据虚线硬阴影）、localStorage 与导入导出兼容。
  - 面板 `public/studio.html`：顶部主题选择（6+经典）、文章类型下拉、签名开关；样式进 `styles.css`。
- 改了哪些文件：`public/themes.js`（新增）、`public/app.js`、`public/studio.html`、`public/styles.css`、`lib/deepseek-normalizer.js`。
- 如何验证：三个 JS 文件 `node --check` 通过；浏览器对 6 主题客观核对主色/圆角/对齐/硬阴影/虚线；复制 HTML 无 class/id/grid/媒体查询/CSS 变量等禁用项且含引言卡/目录/签名；classic 无盖层无目录无签名、旧选择器正常（零回归）；禅意截图人工确认。
- 待办/风险：① 许可证经核实为 GNU **AGPL-3.0**（比 GPL 更严，网络服务也触发），组件外观移植属衍生作品，需保留来源声明（已写进 themes.js/styles.css 注释）；若闭源须只用色值事实、组件重新原创。② 英文章节标签（CHAPTER ONE 等）未做——需 AI 逐标题生成的新字段，本期未加。③ 禅意衬线感贴公众号会回落系统宋体（沿用去字体策略）。④ 真实粘贴公众号仍建议逐主题抽查。

### 2026-09-14 安装外部 skill：gzh-design（公众号排版）

- 想做什么：安装 https://github.com/isjiamu/gzh-design-skill ，把 Markdown 一键排成可粘公众号的 HTML。
- 做成了什么：手动浅克隆官方仓库到 `C:\Users\huyoc\.claude\skills\gzh-design`（含 SKILL.md、6 主题库、4 个 py 脚本）；该目录被 Cursor 自动扫描，重开会话后可触发（说"公众号排版/gzh"）。未执行其 `npx skills add`。
- 改了哪些文件：仅新增上述 skill 目录（在 yooco 仓库外），未动产品代码。
- 如何验证：SKILL.md/脚本/references 下 8 个 theme-*.md 齐全；Read 读中文正常（PowerShell 显示乱码仅是 GBK 控制台问题）。
- 待办/风险：Python 已用 winget 装好（Python.Python.3.13，用户级，3.13.15）；已设用户环境变量 `PYTHONUTF8=1` 解决中文控制台 emoji 报错；实测 component_lint（ERROR×0）与 validate_gzh_html（好/坏样本退出码 0/1）均正常。协议 AGPL-3.0，仅本地排版无影响。重开会话后该 skill 才会被 Cursor 识别。

### 2026-09-14 按钮「优化版本」改名「优化排版」

- 想做什么：用户要求把主按钮文案从「优化版本」改为「优化排版」。
- 做成了什么：按钮文案 + 输入框 placeholder 里对按钮的称呼一并改掉；逻辑/按钮 id 未动。
- 改了哪些文件：`public/studio.html`（第 28、31 行各一处文案）。
- 如何验证：刷新 5173 studio，快照中按钮名与 placeholder 均为「优化排版」。
- 待办/风险：无；全仓搜索确认再无「优化版本」残留。

### 2026-09-14 修复「序号大字」标题序号竖排

- 想做什么：标题样式选「序号大字」(index) 时，序号「02」被竖排成上下两行。
- 做成了什么：根因是「左竖条」基础规则给 `.section-title::before` 定死了 17px×4px 的横条尺寸，index 规则只换了 content 没重置尺寸，两位数字被挤到换行。已在 index 的 `::before` 显式重置 `width/height:auto;margin:0;border-radius:0;background:none;flex:0 0 auto;white-space:nowrap`。复制到公众号的内联 HTML 用的是真 `<span>`，本来就不受影响，无需改。
- 改了哪些文件：`public/styles.css`（index 标题 `::before` 一条规则）。
- 如何验证：5173 studio 选 index，CDP 量得 ::before 从 17×4 变为 45×36.5、white-space:nowrap；高清截图「01」横排正常。
- 待办/风险：仅预览 CSS 修复；真实公众号粘贴用内联方案，建议用户顺带扫一眼。

### 2026-09-14 P3 步骤块与数据亮点块

- 想做什么：开始 P3（步骤块、数据亮点块）。
- 做成了什么：新增 `:::steps` / `:::stat`；打通解析、预览、复制、AI 白名单与提示词。未做表格等平台组件。
- 改了哪些文件：`public/app.js`、`public/styles.css`、`public/studio.html`、`lib/deepseek-normalizer.js`、`CONTEXT.md`（v17）。
- 如何验证：注入样例可见步骤与数据块；复制 HTML 含内容且无 ul/ol；`node --check` 通过。
- 待办/风险：AI 是否主动输出 steps/stat 需实文验证；stat 禁止编造数字已写入提示词。

## 归档

### 2026-09-14 P2 暗色预览 + 合规面板 + 预览对齐复制

- 想做什么：开始 P2。
- 做成了什么：预览效果与复制对齐；暗色预览；合规面板；复制可加 data-no-dark。
- 改了哪些文件：`public/app.js`、`public/styles.css`、`public/studio.html`（v16）。
- 如何验证：页面出现合规条与暗色预览；marker 无渐变；勾选锁定后复制 HTML 含 data-no-dark；`node --check` 通过。
- 待办/风险：暗色预览是实验室模拟，非微信真实算法；data-no-dark 对子节点带内联色仍有限。

### 2026-09-14 P1 列表/代码/图片复制合规

- 想做什么：接着做 P1（列表、代码块、图片）。
- 做成了什么：复制不再输出 ul/ol；代码显式换行空格；外链图与占位有提示；预览图可读时写 data-w/data-ratio。
- 改了哪些文件：`public/app.js`、`public/studio.html`（v15）。
- 如何验证：浏览器注入样例 HTML，确认无 ul/ol、有 br/nbsp、外链提示；`node --check` 通过。
- 待办/风险：图片未加载时无 data-w；外链仍可能被公众号拦，需用户换素材库。

### 2026-09-14 写项目体验分享稿（wechat-writing）

- 想做什么：用 wechat-writing skill 写一篇本项目的体验分析文章用于分享，造物者第一人称。
- 做成了什么：亲手在 5173 走完整流程（贴文→AI 优化判「克制高级」→换 3 方向→暗色预览），截 5 张真图；产出正文+简报+证据底稿+评分（88 分达标）。
- 改了哪些文件：新增 `articles/yooco-lab-experience/`（article.md、writing-brief.md、facts-evidence.md、quality-score.md、imgs/outline.md、imgs/screenshots/S01–S05.png）。未改任何产品代码。
- 如何验证：5 张截图均本机实测；事实分官方/实测/编造边界，测试文案的「40 分钟/99%」未当功效；评分 88。
- 待办/风险：产品暂无公开链接，文末未给试用入口；真实粘贴公众号后台仍缺一张后台截图；用户暂未要封面/飞书。测试文已从 5173 的 localStorage 清除，5174 原文未受影响。

### 2026-09-14 P0 合规复制配置（不接 CLI）

- 想做什么：P0 不接官方 CLI，直接让一键复制输出更易过规范。
- 做成了什么：`buildCopyHtml` 去掉自定义字体、固定内容宽；分隔线与半透明序号按规范改写。
- 改了哪些文件：`public/app.js`、`public/studio.html`（v14）。
- 如何验证：`node --check public/app.js`；需用户本机复制贴公众号确认。
- 待办/风险：预览字体与粘贴字体可能不一致（刻意为之）。P1 已继续完成。

### 2026-09-14 公众号编辑器规范对照清单

- 想做什么：结合官方插件规范与 verify-article-structure-spec，列出可完美复制 / 有问题 / 可新增能力。
- 做成了什么：完成对照分析与画布清单；明确 P0=字体/宽度/CLI 自检。未改业务代码。
- 改了哪些文件：无产品代码；画布 `canvases/wechat-editor-compat.canvas.tsx`（Cursor 侧）。
- 如何验证：对照 `verify_article_structure.md` + `buildCopyHtml` 审阅；未本机跑 CLI。
- 待办/风险：落地前需用户确认优先修哪几项；真实粘贴仍需本机+公众号后台确认。

### 2026-09-14 一键复制排版挪到预览标题右侧

- 想做什么：红框位置（「01 最终预览」右侧原「点击文字即可修改」）改成「一键复制排版」，点完可贴到公众号。
- 做成了什么：标题行右侧放复制按钮；文章底部旧按钮去掉；复制逻辑仍走 `copyRichText`。
- 改了哪些文件：`public/studio.html`、`public/styles.css`。
- 如何验证：刷新 `studio.html` 后右上角有按钮；点击有反馈。自动化浏览器剪贴板被拦，需用户本机点一次再贴到公众号确认。
- 待办/风险：真实粘贴到公众号仍需用户本机确认。

### 2026-09-14 一期：4 方向 11 皮肤 9 造型 + AI 两轴判方向 + 样式锁定

- 想做什么：让提示词输出更好看的排版。拷问后定方案：4 气质方向、每方向 2~3 皮肤、3×造型，AI 判方向定基调，用户调过就锁定。
- 做成了什么：`app.js` 建 MOODS/SKINS（替代 5 个旧预设），state 加 headingStyle/cardStyle/listStyle/mood/skin；右栏加方向卡+皮肤胶囊+造型下拉；CSS 用 data-attribute 实现 4×3 造型；复制公众号 HTML 全部内联适配；normalizer 白名单新字段；系统提示词重写为三步（两轴判 mood→选 skin→给造型）；旧 localStorage 配置自动迁移。
- 改了哪些文件：`public/app.js`、`public/studio.html`、`public/styles.css`、`lib/deepseek-normalizer.js`、`CONTEXT.md`。
- 如何验证：三篇测试文（MetaRSI 硬科技/排版 skill 教程/K3 种草）AI 分别判 deep/editorial/lively，全对（教程文首判 lively，加「≥3 编号小节优先 editorial」规则后修正）；造型 computed style 确认生效；手动切暗黑后再优化样式不被覆盖（锁定生效）；`node --check` 通过。
- 待办/风险：列表序号在公众号靠内联 span 实现（非真计数器）；每篇 AI 约 9~14 秒、偶尔 502 需重试；测试用临时 JSON 已删。

### 2026-09-14 网页预览 + 文章内复制按钮

- 想做什么：去掉手机预览外壳，改成网页预览；「一键复制到公众号」放到文章右下角。
- 做成了什么：预览为白底文档；复制按钮在正文下方右侧；底栏只留字号摘要。复制内容仍是内联 HTML，不含按钮。
- 改了哪些文件：`public/studio.html`、`public/styles.css`、`public/app.js`。
- 如何验证：浏览器无 9:41/手机边框；按钮在文章右下；点击后出现反馈（自动化环境剪贴板被拦，需用户本地点一次）。
- 待办/风险：真实粘贴到公众号仍需用户本机确认。

### 2026-09-13 预览内编辑 + 新布局

- 想做什么：内容编辑与最终预览合并；Hero 输入框 +「优化版本」；点击后下方展示最新排版；布局按草图（上宽输入、下左预览、下右参数）。
- 做成了什么：去掉左栏 Markdown 编辑/结构列表；预览标题和正文可 contenteditable；点按钮先出本地排版再调 `/api/normalize`；滑杆只改 CSS 变量不冲掉光标。
- 改了哪些文件：`public/studio.html`、`public/app.js`、`public/styles.css`。
- 如何验证：填「春日散步」点优化 → 手机预览出现正文；改标题为「春日散步（预览里改过）」仍保留；DeepSeek 返回后高亮/卡片生效；状态「下方预览已更新为优化后的排版」。
- 待办/风险：预览改字回写 Markdown 对复杂 HTML 可能不稳；Hero 输入不再实时刷新预览（必须点按钮）。

### 2026-09-13 去掉右栏网页风格卡片

- 想做什么：删除「03 网页风格」整块，避免和模板参数重复。
- 做成了什么：移除风格卡片 UI；5 套预设仍可通过「选择排版风格」下拉使用；原「04 模板参数」改编号为 03。
- 改了哪些文件：`public/studio.html`、`public/styles.css`、`public/app.js`。
- 如何验证：页面无「网页风格」文案；下拉切到「深夜科技杂志」后预览底色变为深色；恢复默认后回到清爽科技。
- 待办/风险：未同步 `wechat-style-lab` 源项目。

### 2026-09-13 增加复制文章到公众号

- 想做什么：一键复制文章，粘贴到微信公众号发布页并保留当前样式。
- 做成了什么：左栏和预览栏都有「复制文章」；复制 HTML 改为公众号更易接受的内联 `section/p` 样式，去掉实验室水印；首页 iframe 允许写入剪贴板。
- 改了哪些文件：`public/studio.html`、`public/app.js`、`public/styles.css`、`app/page.tsx`。
- 如何验证：页面出现两个「复制文章」按钮；生成 HTML 含字号颜色且无 aside/grid/实验室水印。自动化浏览器因权限拦了真实剪贴板，需用户在自己浏览器点一次再贴到公众号后台确认。
- 待办/风险：公众号编辑器可能改写渐变、部分字体；粘贴后需人工看一眼。

### 2026-09-13 修复 normalize 503 与 favicon 404

- 想做什么：排查控制台 404 / 503。
- 做成了什么：503 是缺 `DEEPSEEK_API_KEY`；已从旁边 `wechat-style-lab` 复制本地密钥到 gitignore 文件，并让 Vite/Wrangler 读入 Worker 环境。补了 `public/favicon.ico` 和页面图标引用。已重启 5174。
- 改了哪些文件：`vite.config.ts`、`app/layout.tsx`、`public/studio.html`、`.gitignore`、`public/favicon.ico`；本地密钥文件未入库。
- 如何验证：`/api/health` → `deepseekConfigured:true`；空文章 POST `/api/normalize` → 400 `EMPTY_INPUT`（不再是 503）；`/favicon.ico` → 200。
- 待办/风险：托管站点仍未配置密钥，需用户明确授权后才能上传。

### 2026-09-14 重启本地开发服务

- 想做什么：重新启动本地预览服务。
- 做成了什么：旧进程已不在；`npm run dev -- --port 5174` 已重新拉起。
- 改了哪些文件：无业务代码。
- 如何验证：`curl.exe --noproxy "*" http://localhost:5174/` → HTTP 200。
- 待办/风险：启动日志仍有代理环境变量警告；请用 localhost 不要用 127.0.0.1。

### 2026-09-13 启动本地开发服务

- 想做什么：启动 yooco-sites 本地预览。
- 做成了什么：`npm run dev -- --port 5174` 已在跑，`http://localhost:5174/` 返回 200。
- 改了哪些文件：无业务代码改动；新建本接手日志。
- 如何验证：`curl --noproxy "*" http://localhost:5174/` → HTTP 200。127.0.0.1:5174 连不上（服务只听 localhost）。
- 待办/风险：5173 被 `ai-audit` 前端占用；启动日志有代理环境变量警告。
