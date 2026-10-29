import { logoutAccount, withSessionCookie } from "@/lib/local-accounts";

export async function POST(request: Request) {
  await logoutAccount();
  const response = Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  return withSessionCookie(response, request, null);
}
