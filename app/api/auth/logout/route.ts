import { cookies } from "next/headers";
import { sessionCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName());
  return Response.json({ ok: true });
}
