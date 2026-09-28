import { currentAccount } from "@/lib/local-accounts";

export async function GET() {
  const account = await currentAccount();
  if (!account) {
    return Response.json({ ok: false }, { status: 401, headers: { "cache-control": "no-store" } });
  }
  return Response.json({ ok: true, email: account.email, name: account.name }, { headers: { "cache-control": "no-store" } });
}
