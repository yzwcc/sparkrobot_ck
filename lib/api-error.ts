const DATABASE_ERROR_PATTERNS = [
  "Can't reach database server",
  "Timed out fetching a new connection",
  "exceeded the data transfer quota",
  "PrismaClientInitializationError"
];

export function apiErrorResponse(error: unknown, fallback: string, status = 400) {
  if (error instanceof Error) {
    console.error(error);
  }

  const message = error instanceof Error ? error.message : "";
  const isDatabaseError = DATABASE_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
  const safeMessage = isDatabaseError
    ? "数据库暂时不可用，请稍后再试或联系管理员检查 Neon 配额。"
    : message || fallback;

  return Response.json({ error: safeMessage }, { status });
}
