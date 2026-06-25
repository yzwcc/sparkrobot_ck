import { apiErrorResponse } from "@/lib/api-error";
import { getRecordPhoto } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const photo = await getRecordPhoto(id);
    return Response.json({ data: { photo } });
  } catch (error) {
    return apiErrorResponse(error, "获取图片失败", 404);
  }
}
