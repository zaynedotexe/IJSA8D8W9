import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const ALLOWED = ["open.spotify.com", "embed.spotify.com", "www.youtube.com", "youtube.com", "youtu.be"];

export async function GET(req: Request) {
  const limit = await checkRateLimit(req, "oembed", 60, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  const url = new URL(req.url).searchParams.get("url") || "";
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (!ALLOWED.some((h) => host === h || host.endsWith("." + h))) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }
  try {
    const endpoint = host.includes("spotify")
      ? "https://open.spotify.com/oembed?url=" + encodeURIComponent(url)
      : "https://www.youtube.com/oembed?url=" + encodeURIComponent(url);
    const res = await fetch(endpoint, { headers: { "User-Agent": "Lonestar/1.0" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
    const data = (await res.json()) as { title?: string; author_name?: string; thumbnail_url?: string };
    let artist = (data.author_name || "").slice(0, 160);
    if (!artist && host.includes("spotify")) {
      try {
        const page = await fetch(url.split("?")[0], {
          headers: { "User-Agent": "Lonestar/1.0" },
          signal: AbortSignal.timeout(8000)
        });
        if (page.ok) {
          const html = await page.text();
          const m = html.match(/"artists":\s*\[\s*\{[^}]*?"name"\s*:\s*"([^"]{1,120})"/);
          if (m) artist = m[1];
        }
      } catch {}
    }
    return NextResponse.json({
      title: (data.title || "Unknown title").slice(0, 160),
      artist: artist || "Unknown artist",
      cover: data.thumbnail_url || null
    });
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 502 });
  }
}
