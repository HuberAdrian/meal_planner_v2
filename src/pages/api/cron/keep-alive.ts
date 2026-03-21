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
    // Create a temporary post
    const keepAlive = await prisma.post.create({
      data: {
        eventDate: new Date(),
        eventType: "keep-alive",
        topic: "keep-alive",
        content: `Database keep-alive ping at ${new Date().toISOString()}`,
        deleted: true, // mark as deleted so it never shows in the UI
      },
    });

    // Delete it immediately
    await prisma.post.delete({
      where: { id: keepAlive.id },
    });

    console.log(`[keep-alive] Ping successful at ${new Date().toISOString()}`);
    return res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[keep-alive] Failed:", error);
    return res.status(500).json({ error: "Keep-alive failed" });
  }
}
