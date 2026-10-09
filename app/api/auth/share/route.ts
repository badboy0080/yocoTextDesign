import { issueShareCode } from "@/lib/local-accounts";

export async function POST() {
  const result = await issueShareCode();
  if (!result.ok) {
    return Response.json(
      { ok: false, message: result.message },
      { status: result.status, headers: { "cache-control": "no-store" } },
    );
  }
  return Response.json(
    { ok: true, code: result.code },
    { headers: { "cache-control": "no-store" } },
  );
}
