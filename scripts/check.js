/* 统一检查。把 scripts/check-*.js 按文件名跑一遍。 */
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = readdirSync(dir).filter((name) => /^check-.*\.js$/.test(name)).sort();
let failed = 0;

for (const name of files) {
  process.stdout.write(`\n--- ${name} ---\n`);
  const result = spawnSync(process.execPath, [path.join(dir, name)], { stdio: "inherit" });
  if (result.status !== 0) failed += 1;
}

if (failed) {
  console.error(`\ncheck failed: ${failed} of ${files.length}`);
  process.exit(1);
}

console.log(`\ncheck passed (${files.length} scripts)`);
