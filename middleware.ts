import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  const routesPubliques  = ["/login", "/register"];
  const estRoutePublique = routesPubliques.some((r) => pathname.startsWith(r));
  const estRouteAuth     = pathname.startsWith("/api/auth");
  const estRouteRegister = pathname.startsWith("/api/register");

  // ─── Protection /admin ────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (!token.isAdmin) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  // ─── Protection générale ──────────────────────────────────────────────────
  if (!token && !estRoutePublique && !estRouteAuth && !estRouteRegister) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && estRoutePublique) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
