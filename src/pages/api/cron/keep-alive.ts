import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    process.env.CRON_SECRET &&
    req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const timestamp = new Date().toISOString();

  // Channel 1: a real query on the Postgres database. Supabase's pause
  // detector counts "user requests to the database", so this alone is enough
  // to keep the free-tier project awake.
  let db: "ok" | "failed" = "failed";
  let dbError: string | undefined;
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "ok";
  } catch (error) {
    dbError = error instanceof Error ? error.message : String(error);
  }

  // Channel 2 (best effort): ping the Supabase REST gateway so API-level
  // activity is registered too. Skipped — never fatal — when the env vars
  // are not configured; a missing var must not take the keep-alive down.
  let rest: number | "skipped" | "failed" = "skipped";
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/Post?select=id&limit=1`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          signal: AbortSignal.timeout(10_000),
        }
      );
      // RLS denies the anon role read access (401/permission denied), but the
      // request still reaches the API gateway and Postgres — that's activity.
      // Only a 5xx means the request never landed.
      rest = response.status < 500 ? response.status : "failed";
    } catch {
      rest = "failed";
    }
  }

  const ok = db === "ok" || typeof rest === "number";
  const body = { ok, db, ...(dbError && { dbError }), rest, timestamp };

  if (ok) {
    console.log(`[keep-alive] ${JSON.stringify(body)}`);
    return res.status(200).json(body);
  }
  console.error(`[keep-alive] ${JSON.stringify(body)}`);
  return res.status(500).json(body);
}
