import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/connexion", "/inscription", "/verifier-email"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get("sellia_session")?.value;

  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"));

  // Pas de session + route protégée → redirect connexion
  if (isProtected && !sessionToken) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Session présente + route auth → redirect dashboard
  // (sauf /verifier-email qui peut être accédé même connecté pendant le flux)
  if (isAuthRoute && sessionToken && !pathname.startsWith("/verifier-email")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/connexion", "/inscription", "/verifier-email"],
};
