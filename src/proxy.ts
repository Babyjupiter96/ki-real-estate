import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const PUBLIC_API_PATHS = ["/api/admin/login", "/api/lead", "/api/track"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isProtectedApi =
    pathname.startsWith("/api/contacts") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/api/analytics";

  const isPublic =
    PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p)) ||
    PUBLIC_API_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic || (!isAdminPage && !isProtectedApi)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);

  if (valid) {
    return NextResponse.next();
  }

  if (isAdminPage) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: ["/admin/:path*", "/api/contacts/:path*", "/api/admin/:path*", "/api/analytics"],
};
