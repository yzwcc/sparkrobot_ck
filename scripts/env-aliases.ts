export function firstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

export function applyDatabaseEnvAliases(env: NodeJS.ProcessEnv = process.env) {
  const databaseUrl = firstNonEmpty(
    env.DATABASE_URL,
    env.POSTGRES_PRISMA_URL,
    env.POSTGRES_URL
  );
  const directUrl = firstNonEmpty(
    env.DIRECT_URL,
    env.POSTGRES_URL_NON_POOLING,
    env.DATABASE_URL_UNPOOLED
  );

  if (databaseUrl && !env.DATABASE_URL) {
    env.DATABASE_URL = databaseUrl;
  }

  if (directUrl && !env.DIRECT_URL) {
    env.DIRECT_URL = directUrl;
  }

  return {
    databaseUrl: env.DATABASE_URL,
    directUrl: env.DIRECT_URL
  };
}
