import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/", "/((?!_next|api/auth).*)(.+)"],
};

export async function middleware(request: NextRequest, _next: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
    if (token && !token.user.error) {
      if (token.user.role) {
        const url = new URL(`/${token.user.role}`, request.url);
        return NextResponse.redirect(url);
      }
      const url = new URL(`/`, request.url);
      return NextResponse.redirect(url);
    }
  }

  const userPublicPath = ["/cart"];
  const matchesUserPublicPath = userPublicPath.some((path) => pathname.startsWith(path));

  if (!!token && token.user.role !== "user" && matchesUserPublicPath) {
    console.log("Unathorized");
    const url = new URL(`/403`, request.url);
    return NextResponse.rewrite(url);
  }

  const protectedPaths = ["/admin", "/seller", "/user", "/auth/user", "/profile"];
  const matchesProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  if (matchesProtectedPath) {
    if (!token || token.user.error) {
      const url = new URL(`/auth/login`, request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    if (
      (pathname.startsWith("/admin") && token.user.role !== "admin") ||
      (pathname.startsWith("/seller") && token.user.role !== "seller") ||
      (pathname.startsWith("/user") && token.user.role !== "user")
    ) {
      const url = new URL(`/403`, request.url);
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
