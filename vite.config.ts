import { readFileSync } from "node:fs";
import { join } from "node:path";
import vinext from "vinext";
import { defineConfig, loadEnv, type ViteDevServer } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./scripts/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "vinext/server/fetch-handler",
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

function readDevVars(filePath: string): Record<string, string> {
  try {
    const out: Record<string, string> = {};
    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (key) out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

export default defineConfig(async ({ mode }) => {
  const localEnv = loadEnv(mode, process.cwd(), "");
  const devVars = readDevVars(join(process.cwd(), ".dev.vars"));

  // Use Miniflare's local Request.cf placeholder unless fetching is requested.
  process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
  process.env.WRANGLER_SEND_METRICS ??= "false";

  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.WRANGLER_REGISTRY_PATH ??= ".wrangler/dev-registry";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      // Preview links use a non-localhost Host. Without this, Vite returns 403 and the page will not open.
      allowedHosts: true,
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      {
        name: "yooco-studio-alias",
        configureServer(server: ViteDevServer) {
          server.middlewares.use((request, _response, next) => {
            const [pathname, search = ""] = (request.url ?? "/").split("?");
            if (pathname === "/studio" || pathname === "/studio/") {
              _response.statusCode = 302;
              _response.setHeader("Location", "/works?panel=studio");
              _response.end();
              return;
            }
            next();
          });
        },
      },
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: {
          ...localBindingConfig,
          vars: {
            DEEPSEEK_API_KEY: localEnv.DEEPSEEK_API_KEY || "",
            DEEPSEEK_MODEL: localEnv.DEEPSEEK_MODEL || "deepseek-flash",
            ANALYTICS_TOKEN: localEnv.ANALYTICS_TOKEN || "",
            ADMIN_EMAILS: process.env.ADMIN_EMAILS || localEnv.ADMIN_EMAILS || "",
            TENCENT_SECRET_ID: firstNonEmpty(
              process.env.TENCENT_SECRET_ID,
              localEnv.TENCENT_SECRET_ID,
              devVars.TENCENT_SECRET_ID,
            ),
            TENCENT_SECRET_KEY: firstNonEmpty(
              process.env.TENCENT_SECRET_KEY,
              localEnv.TENCENT_SECRET_KEY,
              devVars.TENCENT_SECRET_KEY,
            ),
            SES_REGION: firstNonEmpty(process.env.SES_REGION, localEnv.SES_REGION, devVars.SES_REGION),
            SES_FROM_EMAIL: firstNonEmpty(
              process.env.SES_FROM_EMAIL,
              localEnv.SES_FROM_EMAIL,
              devVars.SES_FROM_EMAIL,
            ),
            SES_TEMPLATE_ID: firstNonEmpty(
              process.env.SES_TEMPLATE_ID,
              localEnv.SES_TEMPLATE_ID,
              devVars.SES_TEMPLATE_ID,
            ),
            OTP_DEV_ECHO: firstNonEmpty(process.env.OTP_DEV_ECHO, localEnv.OTP_DEV_ECHO, devVars.OTP_DEV_ECHO),
          },
        },
      }),
    ],
  };
});
