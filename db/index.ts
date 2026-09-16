/**
 * D1 is only wired on the Cloudflare Workers path.
 * No `cloudflare:workers` import here so `next build` / EdgeOne stay clean.
 * Product routes do not call this helper today.
 */
export function getDb(): never {
  throw new Error(
    "Cloudflare D1 binding `DB` is unavailable in this runtime. Database access is only configured for the Workers deployment path.",
  );
}
