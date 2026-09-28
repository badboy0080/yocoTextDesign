import { loginAccount } from "@/lib/local-accounts";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const result = await loginAccount({
    email: String(body?.email || ""),
    password: String(body?.password || ""),
  });
  if (!result.ok) {
    return Response.json({ ok: false, message: result.message }, { status: result.status, headers: { "cache-control": "no-store" } });
  }
  return Response.json({ ok: true, email: result.email, name: result.name }, { headers: { "cache-control": "no-store" } });
}
