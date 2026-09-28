# Yooco 内容排版组件库规格（待议题发布）

## Problem Statement

阿超希望用户粘贴自己的文章后，除了更换整篇主题和标题造型，还能迅速给一整段文字或一组图文套上有设计感的排版。当前工作台已能识别段落、标题、引用、卡片、列表、步骤、数据和图片等内容块，但多数造型选项对整篇文章统一生效。用户很难只突出某个重要段落，作品页的整篇样例也不能代替逐段选择。

这项功能要让没有排版经验的用户用自己的原文判断效果，少做颜色、字号和间距的逐项设置，同时维持手机阅读和公众号富文本复制的可用性。

## Solution

主要流程是「贴入文章 → AI 分析文章 → 选组件 → 编辑/切换 → 复制富文本」。沿用现有 AI 优化入口，先把原文分析为文章类型与内容块；分析完成后，在文章预览和右侧参数区提供「内容组件」。用户选中一个或一组相邻内容块，打开用当前原文生成的组件预览，按「纯文字」「图文」筛选并一键应用。应用后可以换另一款、编辑组件的可选标签与图注，或恢复普通排版。整篇主题继续统一颜色、字体与基础节奏；组件只控制局部结构与强调方式。

首批提供八款：

| 类别 | 组件 | 内容槽位与适用内容 |
| --- | --- | --- |
| 纯文字 | 书刊开篇 | 可选眉题、导语、正文；文章开头或章节开头 |
| 纯文字 | 侧注长段 | 完整正文、可选边注或关键词；知识解释与随笔 |
| 纯文字 | 观点摘录 | 原文判断、解释、可选出处；评论与分析 |
| 纯文字 | 问答对谈 | 问题、回答、可选人物身份；访谈与经验分享 |
| 图文 | 大图叙事 | 现有图片、图注、正文；故事开篇与场景描述 |
| 图文 | 图文并置 | 现有图片、标题、正文；案例与作品说明 |
| 图文 | 双图对照 | 两张现有图片、各自标签、结论；前后对比 |
| 图文 | 步骤图解 | 原有步骤、对应图片、可选注意事项；教程 |

图库中每款以用户选中的真实内容预览，并明确内容要求。没有足够图片、步骤或明确引语时，不补写或伪造内容；可提示补充素材或选择相容的纯文字组件。组件名称不使用数字前缀。样式参考此前讨论的书刊叙事、引语单元和可预览资源库，但以中文长文、窄屏与公众号复制为目标重新设计。

## User Stories

1. As an 文章作者, I want to select one paragraph in the preview, so that I can format only that paragraph.
2. As an 文章作者, I want to select adjacent paragraphs as one section, so that a complete idea can share one layout.
3. As an 文章作者, I want to see my own words in each component preview, so that I can judge the result before applying it.
4. As an 文章作者, I want to filter pure-text components, so that I can design an article without preparing images.
5. As an 文章作者, I want to filter image-text components, so that I can quickly find a layout for an illustrated section.
6. As an 文章作者, I want to see which components fit the selected content, so that I do not repeatedly try incompatible layouts.
7. As an 文章作者, I want to apply a component with one action, so that I do not need to adjust many controls.
8. As an 文章作者, I want to switch between compatible components without losing text, so that I can compare alternatives.
9. As an 文章作者, I want to restore ordinary paragraph layout, so that any design choice is reversible.
10. As an 文章作者, I want a book-like opening for my introduction, so that the first screen establishes a clear reading hierarchy.
11. As an 文章作者, I want a side-note layout for a full paragraph, so that context and main text remain distinct.
12. As an 文章作者, I want to emphasize an existing judgment with its explanation, so that a reader can find the argument quickly.
13. As an 文章作者, I want questions and answers to have separate visual roles, so that interview content is easy to follow.
14. As an 文章作者, I want to combine an existing image, caption, and paragraph, so that the image supports the story.
15. As an 文章作者, I want to place an image beside a short explanation on a wide screen, so that case material reads as one unit.
16. As a 手机读者, I want that image-and-text unit to stack in reading order, so that neither text nor image becomes cramped.
17. As an 文章作者, I want to compare two existing images with labels and a conclusion, so that the difference is explicit.
18. As an 教程作者, I want existing steps and pictures grouped together, so that each action has its matching explanation.
19. As an 文章作者, I want to edit captions, labels, and optional side notes after applying a component, so that the result remains my own.
20. As an 文章作者, I want optional labels to disappear cleanly when empty, so that the page does not show placeholder text.
21. As an 文章作者, I want long Chinese text to wrap without clipping or horizontal scrolling, so that the component works with real articles.
22. As an 文章作者, I want a warning when content exceeds a component's useful length, so that I can choose a calmer layout.
23. As an 文章作者, I want the component to follow my selected theme's colors and fonts, so that the article stays coherent.
24. As an 文章作者, I want component assignments to survive edits, refreshes, and article export/import, so that I do not repeat my work.
25. As an 文章作者, I want assignments to stay with the intended content after a safe edit, so that a different paragraph does not inherit its layout.
26. As an 文章作者, I want a new pasted article to start without the previous article's local component choices, so that the two articles do not mix.
27. As an 文章作者, I want copied rich text to preserve the component's essential hierarchy, so that the final article resembles the preview.
28. As an 文章作者, I want the copied plain-text fallback to preserve the full reading order, so that no sentence or image description is lost.
29. As an 文章作者, I want to know when an image or style may need checking after pasting into a publisher, so that I can correct it before publishing.
30. As an 文章作者, I want the design picker to work with a keyboard, so that I can apply and change layouts without a mouse.
31. As an 文章作者, I want motion-reduced and narrow-screen previews to remain usable, so that design choices are accessible.
32. As an 文章作者, I want AI to analyze my article before I choose a component, so that paragraphs, images, quotations, and steps are identified in context.
33. As an 文章作者, I want to keep choosing components manually when AI optimization is unavailable, so that the feature is not tied to a trial quota.
34. As a 设计维护者, I want each component to declare its required content and theme-aware style rules, so that new components remain consistent.
35. As a 设计维护者, I want the preview and rich-text export checked through the same user flow, so that a visually correct preview does not hide a broken copied result.
36. As an 文章作者, I want the AI analysis result to show suitable component choices for each section, so that I can decide quickly without the AI applying a layout on my behalf.
37. As an 文章作者, I want AI analysis and suggestions to use only my existing text, images, numbers, and attribution, so that styling never invents claims.
38. As an 文章作者, I want to retry AI analysis without losing the text or component choices I have already made, so that a failed request does not undo my work.

## Implementation Decisions

- Keep the project's vocabulary: 「主题」 is the whole-article visual package, 「造型」 describes existing heading/card/list treatments, 「内容块」 is the parsed unit, and 「内容组件」 groups one or more contiguous blocks into a local layout. Do not label a component as a new theme.
- The first release includes the eight components above. A component declares its compatible block types, required and optional content slots, preferred content-length range, and narrow-screen fallback. The gallery filters by compatibility and explains why an option is unavailable.
- The primary entry is the existing AI analysis action after the user pastes an article. Reuse its structured content blocks and article type to rank compatible components; the AI does not automatically apply a local component. A failed or quota-limited analysis leaves the article editable and the manual component picker available.
- Put component selection beside the existing preview and right-side controls. After analysis, clicking a content block or selecting an adjacent group opens the gallery with real-content previews; it must not require a separate editor page or change the current article-wide theme controls.
- Retain the original article content as the source of truth. Store component assignments and optional presentation metadata separately, preserving order and provenance. Switching or removing a component must not rewrite the original words. Structural edits must not silently attach an assignment to a different block.
- Save and restore assignments with the article's local state and configuration export/import. Existing articles without component metadata remain readable and use their current rendering.
- Use theme variables for component colors, fonts, and spacing. Local component choices control hierarchy, borders, image placement, and emphasis; optional user micro-adjustments may be added later if evidence shows a need.
- Preview, preview-text editing, and rich-text export must understand the same component assignment. The copied result is static HTML with essential styles carried with the markup; web-only motion is not needed for the copied article. Plain text keeps every sentence, label, caption, and image description in reading order.
- An image-text component uses images already present in the article or explicitly supplied by the user through supported input. Missing images produce a clear prompt or compatible text-only option, never a fabricated image URL. Sources and captions remain editable.
- AI classifies the article structure before component selection. Compatibility and ordering can be computed from the returned content blocks, avoiding a separate model call merely to paint a component. Analysis must not create steps, figures, quotations, sources, or images absent from the input; manual selection remains available when AI cannot run.
- Keep the workbench's existing responsive layout. Image-text compositions can use a wider arrangement in preview but must become a readable single column at phone width and have an export form that can be checked in the target publisher.
- Component names and picker labels do not carry catalogue sequence numbers. Decorations stay restrained so that ordinary paragraphs remain the dominant reading surface.

## Testing Decisions

- Use one high-level behavioral seam: paste a real article, run AI analysis, select content, preview and apply a suggested or manually chosen component, edit it, switch or remove it, refresh or import it, then copy the result. Assertions should inspect visible reading order, preserved words, selected state, and produced rich/plain content rather than internal functions or CSS class names.
- Exercise that seam with at least one pure-text and one image-text component. Include a long Chinese paragraph, missing-image case, theme change, and a previously saved article. Check desktop and narrow-screen viewports.
- Verify that preview edits do not duplicate decorative labels into the article source and that a component assignment does not migrate to the wrong paragraph after content structure changes.
- Verify the AI-analyzed structure and component suggestions against source material: no new facts, quote text, statistics, or image URLs. Use a controlled response for repeatable browser-flow checks and perform one real AI-request acceptance with a sample article. A failed request must keep the source text and manual application available.
- Inspect copied HTML in a neutral document and manually paste representative components into the target公众号 editor before release; a successful browser preview alone is insufficient evidence of paste fidelity.
- Prior art in this repo is browser-level workbench checking, copied-HTML inspection, JavaScript syntax checks, and production builds. No existing automated feature-test suite was found; add the minimum browser-flow coverage for this new behavior instead of mirroring each component's implementation in separate tests.

## Out of Scope

- Automatically composing a whole article from multiple components in this first release; 「书刊长文」「方法指南」「人物访谈」 can follow after local components prove useful.
- New image hosting, image generation, or a new media-upload service.
- A marketplace, user-published component packs, collaborative editing, or account-bound sharing.
- Reproducing external sites' assets, brand identities, animations, or exact layouts.
- Replacing the current theme system, rewriting the AI model integration, or deploying this feature as part of the specification task.

## Further Notes

- Current code already parses and renders article blocks and has separate rich-text copying. Component assignment must cover both paths; a preview-only treatment would miss the user's publishing outcome.
- Current local block-type overrides are keyed by block position. That is not by itself a safe identity for a multi-block component after edits; the implementation should explicitly define how assignments survive or reset when blocks split, merge, move, or disappear.
- The checked-in glossary currently describes an older theme count and still names a removed theme. Use the active theme registry as the current behavior; update the glossary during implementation, without reintroducing the removed theme.
- [Getty Tracing Art](https://www.getty.edu/tracingart/) supplies a reference for image, chronology, and explanatory text as one story; [Obys Design Books](https://library.obys.agency/) separates books, authors, and quotations; [Cash App Brand Guidelines](https://design.cash.app/) separates foundations, expressions, tokens, and components; [Osmo](https://www.osmo.supply/) presents previewable resources. Individual component treatments in this spec are Yooco proposals for Chinese long-form reading, not claims that the references use identical visual layouts.
- Issue tracker setup is done. Remaining gaps are GitHub issues #6–#10, not one parent issue for this whole specification. #9 replaces the earlier rule that AI only recommends a component and does not apply it: after optimization, suitable paragraphs get a component automatically. #6, #7, and #8 can start immediately. #10 is for a human to paste into the WeChat editor.
