import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getSessionCookieName } from "./lib/auth-server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-change-in-production"
);

// This function can be marked `async` if using `await` inside
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  const token = request.cookies.get(getSessionCookieName())?.value;

  console.log(`[Middleware] ${pathname} - Token: ${token ? "✓" : "✗"}`);

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    console.log(`[Middleware] Redirecting to /login`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);

      // If authenticated and trying to access login/signup, redirect to dashboard
      if (pathname === "/login" || pathname === "/signup") {
        console.log(
          `[Middleware] Already logged in, redirecting to /dashboard`
        );
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error(`[Middleware] Invalid token:`, error);

      // Token is invalid, clear it and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(getSessionCookieName());
      return response;
    }
  }
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
