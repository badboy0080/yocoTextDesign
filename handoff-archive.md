# 历史交接记录

### 2026-09-23 重启本地服务

- 想做什么：重启本地开发服务。
- 做成了什么：停掉 5174 上的旧进程，重新启动。5173 上是别的项目，没动。
- 改了哪些文件：`handoff-log.md`。
- 如何验证：`http://localhost:5174/api/health` 返回 `ok: true`，DeepSeek 已配置。
- 待办/风险：提示词改动还没提交、没部署。

### 2026-09-23 C 灵感气泡精修与资产交付

- 想做什么：选择 C 方案继续精修。
- 做成了什么：保留气泡双眼，调整字重、字距与内部留白；制作字体无依赖的矢量与透明 PNG，包含横版、上下组合、独立图案、黑白版与 16–512px 图标。
- 改了哪些文件：`design/yooco-rounded-logo-20260923/c-final/`、设计简报和日志。
- 如何验证：目视检查 16/24/32/48/64px 图标和 120/160/192px 横版；独立验收通过 10 个核心 SVG、透明通道、边界、8 个图标尺寸与黑白眼睛镂空。展示板说明文字仍用系统字体，不属于 Logo 字形。
- 待办/风险：16px 尾部细节较弱，常规图标建议至少 24px；网站接入与浏览器标签实测待做，未部署。

### 2026-09-23 精简工作台文案

- 想做什么：去掉工作台里反复解释功能的文字，保留必要操作提示。
- 做成了什么：清理首屏说明和参数复述；换成短示例文章；语法和风险处理建议收进悬停/聚焦提示；署名的预览与复制稿统一。
- 改了哪些文件：`public/studio.html`、`public/app.js`、`public/styles.css`、`handoff-log.md`、`handoff-archive.md`、`workUp.md`。
- 如何验证：浏览器检查默认页、主题、署名和复制反馈；JS 语法、生产构建、`git diff --check` 通过。
- 待办/风险：改动仍在本地，未部署；浏览器显示复制成功，但剪贴板内容未能通过浏览器工具读取，真实公众号粘贴仍待验收。

### 2026-09-23 提示词改成按主题拆文章

- 想做什么：第一版按文章选题并按配方拆块；没改参数时再优化随机换主题并重拆；改过就锁定；恢复默认后重新按文章选；抽到经典时气质和皮肤仍按文章选。
- 做成了什么：系统提示词不再要求模型填颜色。工作台把本次主题规则发给接口。选中主题后只用主题表里的颜色和造型。
- 改了哪些文件：`lib/deepseek-normalizer.js`、`app/api/normalize/route.ts`、`public/app.js`、`public/studio.html`、`CONTEXT.md`、`handoff-log.md`。
- 如何验证：刷新工作台。第一次优化按文章选题。不改参数再点一次，主题从七个里换。改过滑杆后再点，主题不动。
- 待办/风险：还没提交、没部署。要刷新工作台才加载新脚本。

### 2026-09-23 作品差异、长文、Logo 与按钮统一

- 目标：扩大六件作品的排版差异、延长点开后的文章、设计 Logo，并按主次统一按钮颜色。
- 完成：六种杂志/路书/评论/留白/山景/票据版式与完整示例长文；纸页 Y 矢量标志覆盖三页及浏览器图标；主操作按钮用首页浅绿渐变，导航、切换、上传、轮播、关闭、下载配置及工作台次要按钮用高级灰。
- 文件：`lib/works.ts`、`components/work-modal.tsx`、`app/works.css`、`components/brand-logo.tsx`、`public/yooco-mark.svg`、`public/favicon.svg`、主页/工作台样式与入口、按钮组件、交接日志。
- 验证：`npm run build:edgeone`、`npx tsc --noEmit`、相关文件定向 ESLint 通过；浏览器检查作品封面、长文弹窗滚动、做同款进入工作台，以及首页、作品弹窗、工作台主绿次灰的实际颜色。全量 ESLint 中 metrics 旧 useEffect 警告未处理。
- 待办：正式部署、真实 AI 请求及公众号粘贴未验收；当前改动未提交。

### 2026-09-22 主标题改用官方文字动画

- 想做什么：不要粒子，改用 https://demos.gsap.com/demo/animate-text/ 。
- 做成了什么：删掉粒子。标题和副标题按官方三种方式轮播：逐字从右滑入、逐词落下并旋转、逐行翻转。每种播完停约 2 秒。
- 改了哪些文件：`app/hero-type-morph.tsx`、`app/home.css`、`handoff-log.md`。
- 如何验证：`http://localhost:5174/`。动画中字在动（例如「把」的透明度从淡到实，位置从右侧归位）。左上小字会在「逐字 / 逐词 / 逐行」之间换。
- 待办/风险：还没提交、没部署。中文没有空格，逐词是按我插的看不见的断点分成几段，不是英文那种按空格分词。



### 2026-09-22 对照 GSAP 官方文字案例

- 想做什么：现有粒子不好看。先找官方相近案例，再汇报，先不改代码。
- 做成了什么：官方没有「文字化成粒子再聚合成新排版」。官方文字是 SplitText（真字错位再归位）、ScrambleText（字符打乱再显出）、遮罩逐行升起。粒子飞字是别人用 WebGL 画的，GSAP 只负责把进度从 0 拨到 1。
- 改了哪些文件：`handoff-log.md`。
- 如何验证：看汇报里的官方链接。首页粒子代码没动。
- 待办/风险：等阿超选方向。别再在现有小黑点上改。



### 2026-09-22 主标题按约定重做粒子

- 想做什么：按写好的需求做主标题粒子。前 2 秒是能读的两行字，只是摆得乱；中间逐字化成粒子飞走，飞到就消失并淡入排好的字；最后只留两行干净的字，没有黑点。
- 做成了什么：一轮 10 秒。0–2 秒两句原文。2–6.5 秒逐字飞，每字大约 30 个点，后面再跟两批晚出现的点。6.5–10 秒强制收成成品。四种样式轮流。
- 改了哪些文件：`app/hero-type-morph.tsx`、`app/home.css`、`handoff-log.md`。
- 如何验证：`http://localhost:5174/`。乱放时两句是整句，不是散字。飞行中大约同时只有几个字在飞。收尾截图是「左齐绿线」，只有标题和绿字副标题，没有黑点。
- 待办/风险：还没提交、没部署。作品区没改。



### 2026-09-22 标题粒子放慢并加长拖尾

- 想做什么：整段动画慢一倍，粒子拖尾更长。
- 做成了什么：去掉单粒子画线拖尾。每个点后面再跟三批粒子，出现更晚，活得更久，走同一条路。
- 改了哪些文件：`app/hero-type-morph.tsx`、`handoff-log.md`。
- 如何验证：刷新首页，粒子后面还有更晚出现的点在跟着飞，没有画出来的线尾巴。
- 待办/风险：还没提交、没部署。最晚的跟随粒子大约在 6 秒多消失，10 秒换样式还赶得上。



### 2026-09-22 主标题改成粒子换样式

- 想做什么：去掉「三步发出去」整块，作品区上移。主标题和副标题用粒子从乱放收成排好的版，每 5 秒换一种样式。
- 做成了什么：删掉三步模块和黑底演示。标题区四种成品：居中衬线、左齐绿线、朱红、素墨。乱放的字逐个消失，粒子飞到新位置，再出现排好的字。
- 改了哪些文件：`app/hero-type-morph.tsx`、`app/home-landing.tsx`、`app/home.css`、`app/works.css`、`handoff-log.md`。
- 如何验证：打开首页，没有「三步发出去」；标题上方小字会在四种样式间换；作品栏紧跟输入框下面。
- 待办/风险：四种样式是我按现有主题定的，阿超可以改。还没提交、没部署。



### 2026-09-22 首页作品集和作品页

- 想做什么：首页一行作品，悬停停住；点开看排好的版，能做同款、下载配置；查看更多进作品页，左侧只有 logo 和工作台。
- 做成了什么：首页作品栏自动横滑，悬停暂停，一屏大约 4 张。弹窗有「做同款」「下载此排版配置」。作品页 `/works` 左侧 Yooco 回首页，工作台进 `/studio`。
- 改了哪些文件：`lib/works.ts`、`components/works-rail.tsx`、`components/works-gallery.tsx`、`components/works-frame.tsx`、`components/work-modal.tsx`、`app/works/page.tsx`、`app/works.css`、`app/home-landing.tsx`、`handoff-log.md`。
- 如何验证：`http://localhost:5174/` 有「查看更多」和作品卡片；点卡片出现两个按钮；`/works` 有 Yooco 和「工作台」。
- 待办/风险：还没提交，也没部署。作品是六套主题的示例文，不是用户真实稿。



### 2026-09-22 动效改成黑底逐字移动

- 想做什么：演示区改黑底、加线条纹理，文字改成一个字一个字地动。
- 做成了什么：演示改成真文字。散落的字逐个消失，粒子从字上飞向排好的位置，排好的字再逐个出现。结束时是正常文字，不是点阵字。
- 改了哪些文件：`app/format-morph.tsx`、`app/home.css`、`handoff-log.md`。
- 如何验证：打开 `/#yooco-flow`。先看到正常的散落文字，再看到粒子飞过去，最后出现排好的标题、正文、引用。
- 待办/风险：还没提交，也没部署。5173 被别的项目占用，本地预览在 5174。



### 2026-09-22 首页加上排版动效

- 想做什么：用 GSAP 做一段杂乱文字收成排好版式的过程。
- 做成了什么：在「三步发出去」标题下加了循环演示。同一段短文先散开，再收回白卡片（标题、正文、绿竖线引用）。输入框仍在第一屏。系统开启「减少动态效果」时只显示排好的样子。
- 改了哪些文件：`app/format-morph.tsx`、`app/home-landing.tsx`、`app/home.css`、`package.json`、`package-lock.json`、`handoff-log.md`。
- 如何验证：打开 `/#yooco-flow`，先看到「没排版」的散字，再收成「排好了」的卡片，然后循环。
- 待办/风险：还没提交，也没部署到 EdgeOne。



### 2026-09-22 首页副文案改短

- 想做什么：主句下面那句改成「粘贴文章，优化排版」。
- 做成了什么：首页副文案和页面描述都改了。三步模块里的「Markdown 进来」没动。
- 改了哪些文件：`app/home-landing.tsx`、`app/layout.tsx`、`handoff-log.md`。
- 如何验证：打开 `/`，主句下是「粘贴文章，优化排版」。
- 待办/风险：还没提交，也没部署到 EdgeOne。



### 2026-09-22 提交并部署 EdgeOne

- 想做什么：提交首页改动，部署到 EdgeOne。
- 做成了什么：提交 `a1ea53b`。生产部署成功，部署号 `dpbhekkirxkc`，项目 ID 现为 `makers-8cjhosfqcnmc`。预览页已是新首页：有输入框和「三步发出去」，没有「免费试用 10 次」和价格板块。
- 改了哪些文件：`handoff-log.md`（部署记录）。代码提交见上一则。
- 如何验证：预览页 HTML 含「开始一篇」「优化排版」，不含「免费试用 10 次」。
- 待办/风险：未推送到 GitHub。预览链接带时效 token。



### 2026-09-22 首页输入框上到第一屏

- 想做什么：输入框放到第一屏；「三步发出去」往下；先藏价格；去掉「免费试用 10 次」按钮。
- 做成了什么：输入框跟在主句下面；三步模块在输入框之后；价格板块和顶栏价格入口用开关藏起；两个试用按钮和底部「现在就排一版看看」去掉。
- 改了哪些文件：`app/home-landing.tsx`、`app/home.css`、`handoff-log.md`。
- 如何验证：桌面和窄屏第一屏都能看到输入框；页面上没有「免费试用 10 次」和「价格」；空着点「优化排版」会提示先输入。
- 待办/风险：价格文案还在代码里，`SHOW_PRICING` 改成 `true` 可恢复。页脚仍有「符合条件可申请退款」。



### 2026-09-22 启动本机开发服务

- 想做什么：切到本机后启动本地版本。
- 做成了什么：去掉 `vite.config.ts` 里重复的 `nodejs_compat`（`wrangler.jsonc` 已有）。`npm run dev` 已在 http://localhost:5173/ 跑起来，并读到 `.dev.vars`。
- 改了哪些文件：`vite.config.ts`、`handoff-log.md`。
- 如何验证：`/api/health` 为 `deepseekConfigured:true`；首页和工作室都是 200。
- 待办/风险：未在浏览器里点「优化排版」走完整请求；启动日志仍有代理环境变量警告。



### 2026-09-18 首页主句改回中文

- 想做什么：增长/内容反馈纯英文 H1 不利于公众号作者第一眼理解，主句改回中文。
- 做成了什么：H1 改为「把一篇好文章，排成读者愿意读完的样子」；hero 不再放英文；字体用站点已有中文友好衬线栈，不用 Playfair italic。绿色试用 CTA、三档价、退款小字、visit/trial_click 未动。
- 改了哪些文件：`app/home-landing.tsx`、`app/home.css`、`app/layout.tsx`、`docs/pr-preview/homepage_hero_desktop.webp`、`docs/pr-preview/homepage_hero_mobile.webp`、`handoff-log.md`。
- 如何验证：打开 `/` 主句为中文；点「免费试用 10 次」仍进工作室；`npm run build` 与 `npm run build:edgeone` 通过。
- 待办/风险：无。



### 2026-09-18 主句改英文 Playfair italic

- 想做什么：主句贴近用户给的 John Doe 字体气质；中文没有合适连笔钢笔体，所以主句改英文。
- 做成了什么：H1 改为 “Make a good article worth finishing.”，Playfair Display italic；绿色试用 CTA、三档价、退款小字、visit/trial_click 未动。
- 改了哪些文件：`app/home-landing.tsx`、`app/home.css`、`app/layout.tsx`、`docs/pr-preview/`、`handoff-log.md`。
- 如何验证：打开 `/` 主句为英文斜体衬线；点「免费试用 10 次」仍进工作室。
- 待办/风险：中文用户要靠副句理解产品；未改工作室示例标题。



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

### 2026-09-22 每轮换排版，停 5 秒

- 想做什么：进场动画保持官方那种，但每一轮排版要不一样，停顿改成 5 秒。
- 做成了什么：进场仍是逐字、逐词、逐行。排版轮流换成居中衬线、左齐绿线、朱红副标题、素墨细线。播完停 5 秒。
- 改了哪些文件：`app/hero-type-morph.tsx`、`app/home.css`、`handoff-log.md`。
- 如何验证：`http://localhost:5174/`。约十几秒内看到居中衬线、朱红副标题、素墨细线来回换。朱红是左齐、副标题红色。
- 待办/风险：还没提交、没部署。
### 2026-09-22 首页灰色点阵，鼠标周围变蓝

- 想做什么：背景加灰色点矩阵。鼠标经过时，以鼠标为圆心，周围一圈点辐射状变成蓝色。
- 做成了什么：点阵组件放在 `components/ui/dot-pattern.tsx`。首页铺满灰点，鼠标周围大约 200 像素内的点变成蓝色，越远越淡。
- 改了哪些文件：`components/ui/dot-pattern.tsx`、`components/home-dot-field.tsx`、`app/home-landing.tsx`、`handoff-log.md`。
- 如何验证：`http://localhost:5174/`。空白处能看到灰点。鼠标移到左边空白处，出现一圈蓝点。
- 待办/风险：还没提交、没部署。输入卡片和作品卡片是白底，点在卡片下面，不会盖住字。
### 2026-09-22 灰点减淡，蓝点加大

- 想做什么：灰色点透明度降低 50%，蓝色点放大 10%。
- 做成了什么：灰点从不透明度 80% 降到 40%。蓝点半径从 1.35 放到 1.485。
- 改了哪些文件：`components/home-dot-field.tsx`、`handoff-log.md`。
- 如何验证：`http://localhost:5174/`。灰点更淡。鼠标停在空白处，蓝点比灰点略大。
- 待办/风险：还没提交、没部署。
### 2026-09-22 输入框收成一块，按钮改绿渐变

- 想做什么：去掉「开始一篇」，整块做成一个输入框。「优化排版」用上传的那张绿渐变。
- 做成了什么：标题条删了，输入区直接从占位文字开始。按钮从左 `#A9FD83` 过渡到右 `#98F68D`。
- 改了哪些文件：`app/home-landing.tsx`、`handoff-log.md`。
- 如何验证：`http://localhost:5174/`。页面上没有「开始一篇」。按钮是浅绿色，字是深色。
- 待办/风险：还没提交、没部署。渐变左右很接近，看起来接近一块浅绿。
### 2026-09-23 页面设计参考第一轮筛选

- 想做什么：从七个参考网站筛选适合主页、作品页、作品弹窗与工作台的设计，并按 grill-with-docs 分轮讨论。
- 已完成：核对四页实现与公开来源，建议 Osmo + Obys 为主，Made With GSAP 补充横轨交互。方案未确认，未修改页面代码。
- 文件：docs/design-reference-review.md、handoff-log.md、handoff-archive.md（超出最近五次的记录归档）。
- 验证：源码与公开网页内容核对；浏览器截图连续超时，具体视觉与动态效果尚未验证。
- 后续确认：两轮主要选择已记录于当前摘要和讨论稿；新增标题中英文六版提案待确认。ADHD 抓取失败，Bleibt Gleich 当前内容与预期可能不一致；参考站具体动效仍待浏览器核验。

### 2026-09-23 四页设计实现与本地验收

- 目标：按已确认的杂志气质、暖白墨黑绿色、电脑优先方案实现四类页面。
- 完成：六版中英标题、横轨拖拽、网格筛选、大预览与焦点返回、工作台外壳精修；修正手机双列和复制提示溢出、做同款标题同步。
- 文件：app/hero-type-morph.tsx、app/home.css、app/works.css；components/work-modal.tsx、works-gallery.tsx、works-rail.tsx；public/styles.css、studio.html、app.js；lib/works.ts；设计稿、交接与复盘记录。
- 验证：生产构建、类型、定向 ESLint、JS 语法；1440/375/320 浏览器检查；标题固定高度、筛选、拖拽防误触、弹窗退出、做同款、暗色预览、复制通过。
- 待办：配置下载触发但未收到下载事件，文件落盘未确认；真实 AI 与公众号粘贴未验收；未提交、未部署。本地使用 next start --port 5174，避免与 vinext 同时改写 .next 类型。

### 2026-09-23 工作台配置框层级

- 目标：配置框之间有间距，未展开为白色，展开为淡灰色。
- 完成：右侧参数框统一留 10px 间距，独立细边框；按展开状态切换白/淡灰背景，原有选项布局与交互保留。
- 文件：`public/styles.css`、`handoff-log.md`。
- 验证：浏览器检查默认、展开及切换后的背景色和实际间距；`git diff --check` 通过。
- 待办：未提交、未部署。

### 2026-09-23 精简轮播提示与配置选中态

- 目标：移除首页标题和作品横轨的轮播控件；换页脚文案、弹窗关闭 X、工作台选中项绿底深字。
- 完成：两组控件与提示行移除，自动播放/拖动保留；页脚为「你的最佳排版助理」；关闭按钮显示 X 并保留中文无障碍名称；主题、气质、皮肤选中项用绿渐变和深色字。
- 文件：`app/hero-type-morph.tsx`、`app/home.css`、`components/works-rail.tsx`、`app/works.css`、`app/home-landing.tsx`、`components/work-modal.tsx`、`public/styles.css`、日志。
- 验证：生产构建与相关文件 ESLint 通过；浏览器确认控件消失、页脚新文案、X、三类选中项实际颜色。
- 待办：未提交、未部署；真实 AI 与公众号粘贴仍未验收。

### 2026-09-23 登录、注册与订阅页设计预览

- 目标：重新参考最初的网站，为 Yooco 增加登录、注册和订阅页。
- 完成：三页采用书刊式大标题、绿底品牌封面、清晰的账号表单和月/年方案切换；入口连到首页与工作台额度提示；未接入的账号与付款状态清楚标注。
- 文件：`app/login/page.tsx`、`app/register/page.tsx`、`app/subscribe/page.tsx`、`app/account.css`、`components/account-layout.tsx`、`components/auth-page.tsx`、`components/subscribe-page.tsx`、`app/home-landing.tsx`、`public/studio.html`、`public/app.js`、`public/styles.css`、设计记录与日志。
- 验证：Next 生产构建通过；浏览器查看三页和月/年价格切换、注册密码不一致提示；表单无原生提交路径。
- 待办：尚无账号、支付、订单和订阅后端；部署后的本地安全与文案修正尚未再次部署。电脑效果已浏览器核对，手机宽度需继续实测。

### 2026-09-23 提交并部署 EdgeOne

- 想做什么：把当前代码提交，并部署到 EdgeOne。
- 做成了什么：提交 `209c406`、`a9f9b27`、`df82a9a`。生产部署成功，部署号 `dp4dkt9dz1fh`。
- 改了哪些文件：`handoff-log.md`。代码提交见上面三个提交号。
- 如何验证：部署命令返回 Deploy Success。控制台：`https://console.cloud.tencent.com/edgeone/pages/project/makers-8cjhosfqcnmc/deployment/dp4dkt9dz1fh`。
- 待办/风险：没有推送到 GitHub。预览链接带时效 token。稿件、视频、页脚草稿没进这次提交。

### 2026-09-23 排查 EdgeOne 预览链 504

- 想做什么：Edge 打开预览链，控制台出现 504 Gateway Time-out。
- 做成了什么：用新的预览口令打开首页，页面正常。首页文件、登录、订阅、工作室、健康检查、访问统计都是 200。这次没有复现 504。
- 改了哪些文件：无代码改动。
- 如何验证：浏览器打开预览首页，标题和输入框都在；逐个请求资源看状态码。
- 待办/风险：504 是网关等太久。若失败地址是 `/api/normalize`，是点「优化排版」后 AI 超时。需要失败那条请求的网址才能继续修。


### 2026-09-23 展开参数卡片改白底

- 想做什么：把截图中展开的参数设置卡片改为白色背景。
- 做成了什么：展开卡片改为纯白，悬停只用很浅的灰绿；选中项绿色和卡片间距保持不变。
- 改了哪些文件：`public/styles.css`、`public/studio.html`、`handoff-log.md`、`handoff-archive.md`。
- 如何验证：浏览器检查展开背景为白色、收起和展开正常、选中项仍为绿渐变；`git diff --check` 通过。
- 待办/风险：仍在本地，未部署。

### 2026-09-23 工作台预览改为整块画布

- 想做什么：让截图红框里的预览区成为完整的文本画布，去掉像外框的灰色留边。
- 做成了什么：预览背景与文章背景同色同宽，去掉纸页阴影；深色预览也保持整块背景，正文宽度控制和编辑保留。
- 改了哪些文件：`public/styles.css`、`public/app.js`、`public/studio.html`、`handoff-log.md`、`handoff-archive.md`。
- 如何验证：浏览器在手机和电脑宽度检查画布边界，并切换暗色预览、深色皮肤；JS 语法、生产构建、`git diff --check` 通过。
- 待办/风险：仍在本地，未部署；真实公众号粘贴待验收。

### 2026-09-23 Yooco 折页 Logo

- 想做什么：重设计截图中的网站 Logo，并用于全站。
- 做成了什么：把柔和书页改成奶白与浅绿的几何折页 Y；统一字标，更新首页、作品、账号页、工作台和 favicon；提供独立横版 SVG。
- 改了哪些文件：`public/yooco-mark.svg`、`public/favicon.svg`、`public/yooco-logo.svg`、`components/brand-logo.tsx`、`app/globals.css`、`app/layout.tsx`、`public/studio.html`、`public/styles.css`、日志。
- 如何验证：浏览器核对首页导航和横版图形；三个 SVG 可解析；生产构建、`git diff --check` 通过。
- 待办/风险：仍在本地，未部署；未制作印刷版与黑白版。


### 2026-09-23 Yooco 圆润 Logo 三方向提案

- 想做什么：先学习专业 Logo 流程，再设计荧光绿、柔和圆角图案与圆润 Yooco 字标。
- 做成了什么：核对参考图与用途，研究设计指南，生成三方案板；修正首轮过度发光，推荐 A 双 o 小伙伴。
- 改了哪些文件：`design/yooco-rounded-logo-20260923/brief.md`、`prompts.md`、`yooco-concepts-v1.png` 与日志。
- 如何验证：目视检查准确拼写、图文组合、单色与反白示例；设计图已存入项目。
- 待办/风险：待阿超选型；字标偏厚需精修；小尺寸实测、矢量稿、透明独立资产未完成。未改网站、未部署。

### 2026-09-23 工作台并进作品页侧边栏

- 想做什么：工作台不再单独一页，在作品页左侧切换。顶栏只留按钮。侧边栏可折叠。
- 做成了什么：`/works` 用侧边栏切作品和工作台。`/studio` 会跳到 `/works?panel=studio`。工作台顶上只留优化、恢复默认、导出、导入。折叠后只留 logo、两个图标和折叠按钮。
- 改了哪些文件：`components/works-frame.tsx`、`app/works/page.tsx`、`app/works.css`、`public/studio.html`、`public/styles.css`、`app/home-landing.tsx`、`lib/works.ts`、`components/account-layout.tsx`、`components/auth-page.tsx`、`components/subscribe-page.tsx`、`next.config.ts`、`vite.config.ts`、`handoff-log.md`。
- 如何验证：打开 `http://localhost:5174/works`，点工作台能看到预览和参数；点折叠只剩图标；再点展开。
- 待办/风险：还没提交、没部署。

### 2026-09-23 文字排版样式汇总 HTML

- 想做什么：从阿超给出的 40 个网站寻找标题排版灵感，输出可浏览 HTML。
- 做成了什么：24 款中文提案，分文章章节、封面专题、个性表达；附来源、适用场景、参数及证据状态，支持试字、筛选、搜索、收藏、复制清单和窄版。
- 改了哪些文件：`public/typography-atlas.html`、交接日志与阶段复盘。
- 如何验证：JS 语法通过；浏览器确认 24 款/40 来源，分类、搜索与空态、长标题、收藏、复制、390px 窄版；手机宽度无横向溢出、无控制台错误。单文件无外部字体和脚本依赖。
- 待办/风险：多数参考站只确认文本结构，Getty 实看画面，证据不足站已逐条注明。设计为中文适配提案；未接入工作台、未部署，公众号粘贴兼容性待选型后验证。
