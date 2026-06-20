import type { NextApiRequest, NextApiResponse } from "next";

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

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[keep-alive] Missing SUPABASE_URL or SUPABASE_ANON_KEY");
    return res.status(500).json({ error: "Missing Supabase config" });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/Post?select=id&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase REST API returned ${response.status}`);
    }

    return res
      .status(200)
      .json({ ok: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[keep-alive] Failed:", error);
    return res.status(500).json({ error: "Keep-alive failed" });
  }
}
