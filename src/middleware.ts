import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
export async function middleware(request: NextRequest, _next: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  if (pathname.startsWith("/auth/login")) {
    if (token) {
      if (token.role) {
        const url = new URL(`/${token.role}`, request.url);
        return NextResponse.redirect(url);
      }
      const url = new URL(`/`, request.url);
      return NextResponse.redirect(url);
    }
  }

  const protectedPaths = ["/admin", "/seller", "/user"];
  const matchesProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (matchesProtectedPath) {
    if (!token) {
      const url = new URL(`/auth/login`, request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    if (
      (pathname.startsWith("/admin") && token.role !== "admin") ||
      (pathname.startsWith("/seller") && token.role !== "seller")
    ) {
      const url = new URL(`/403`, request.url);
      return NextResponse.rewrite(url);
    }
  }
  return NextResponse.next();
}
