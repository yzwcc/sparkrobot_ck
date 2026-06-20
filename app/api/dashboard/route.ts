import { getDashboardSummary } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const summary = await getDashboardSummary();
  return Response.json(summary);
}

