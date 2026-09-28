import { logoutAccount } from "@/lib/local-accounts";

export async function POST() {
  await logoutAccount();
  return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
