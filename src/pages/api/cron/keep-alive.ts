import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

const CRON_SECRET = process.env.CRON_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify the request is from Vercel Cron
  if (CRON_SECRET && req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Lightweight query — just enough to register database activity
    await prisma.$queryRaw`SELECT 1`;

    console.log(`[keep-alive] Ping successful at ${new Date().toISOString()}`);
    return res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[keep-alive] Failed:", error);
    return res.status(500).json({ error: "Keep-alive failed" });
  }
}
