## Agent skills

### Issue tracker

议题在 GitHub 仓库 `badboy0080/yocoTextDesign`。见 `docs/agents/issue-tracker.md`。

### Triage labels

五张默认标签：`needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human`、`wontfix`。见 `docs/agents/triage-labels.md`。

### Domain docs

单上下文：仓库根一份 `CONTEXT.md`，决策记录放 `docs/adr/`。见 `docs/agents/domain.md`。

### 开 PR 之前

开 PR 前必须跑过 `npm run check`，并把命令和结果写在 PR 里。纳入了哪些检查、怎么单独跑，见 `docs/agents/checks.md`。
