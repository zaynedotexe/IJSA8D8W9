import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PATHS = ["/login", "/me", "/admin", "/api/auth"];

export function middleware(req: NextRequest) {
  const canonical = process.env.NEXT_PUBLIC_SITE_URL || "";
  let canonicalHost = "";
  try {
    canonicalHost = new URL(canonical).host;
  } catch {
    return NextResponse.next();
  }
  if (!canonicalHost) return NextResponse.next();
  const host = req.headers.get("host") || "";
  if (host === canonicalHost) return NextResponse.next();
  const path = req.nextUrl.pathname;
  const isAuth = AUTH_PATHS.some((p) => path === p || path.startsWith(p + "/"));
  if (!isAuth) return NextResponse.next();
  const target = new URL(canonical);
  target.pathname = path;
  target.search = req.nextUrl.search;
  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: ["/login", "/me", "/admin", "/api/auth/:path*"]
};
