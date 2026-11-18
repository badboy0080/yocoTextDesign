import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const tsxCli = fileURLToPath(new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url));
if (!existsSync(tsxCli)) {
  console.error("缺少 tsx。请先在仓库根目录执行 npm ci。");
  process.exit(1);
}

const jsChecks = [
  "scripts/check-block-style.js",
  "scripts/check-emoji-theme.js",
  "scripts/check-highlight-marks.js",
  "scripts/check-humanize-empty.js",
  "scripts/check-mobile-layout.js",
  "scripts/check-normalize-timeout.js",
  "scripts/check-preview-outline.js",
  "scripts/check-slash-cards.js",
  "scripts/check-source-media.js",
  "scripts/check-texture-highlight-density.js",
  "scripts/check-texture-theme.js",
];

const tsChecks = [
  "scripts/check-account-admin.ts",
  "scripts/check-invite.ts",
  "scripts/check-known-accounts.ts",
  "scripts/check-layout-history.ts",
  "scripts/check-otp.ts",
  "scripts/check-seo.ts",
  "scripts/check-session-cookie.ts",
  "scripts/check-unlimited-uses.ts",
];

const env = { ...process.env, NODE_ENV: "development" };
delete env.PAGES_BLOB_DEPLOY_CREDENTIAL;
delete env.PAGES_PROJECT_ID;

function run(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    env,
    stdio: "inherit",
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`\n没通过：${args.at(-1)}`);
    process.exit(result.status ?? 1);
  }
}

console.log("本地检查使用开发环境，并且不带 Pages Blob 凭证。");

for (const file of jsChecks) run([file]);
for (const file of tsChecks) run([tsxCli, file]);

console.log("\n本地检查脚本通过。");
