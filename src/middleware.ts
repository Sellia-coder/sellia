import { NextRequest, NextResponse } from "next/server";

const ROOT_DOMAIN = "getsellia.com";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "auth",
  "mail",
  "cdn",
  "static",
  "assets",
  "billing",
  "checkout",
]);

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/connexion", "/inscription", "/verifier-email"];

function applyShopEmbedHeaders(
  response: NextResponse,
  hostname: string
): NextResponse {
  const hostWithoutPort = hostname.split(":")[0] ?? "";
  const isShopSubdomain =
    (hostWithoutPort.endsWith(`.${ROOT_DOMAIN}`) &&
      !RESERVED_SUBDOMAINS.has(
        hostWithoutPort.replace(`.${ROOT_DOMAIN}`, "")
      )) ||
    hostWithoutPort.endsWith(".lvh.me") ||
    hostWithoutPort.endsWith(".localhost");

  if (isShopSubdomain) {
    response.headers.delete("X-Frame-Options");
    response.headers.set(
      "Content-Security-Policy",
      "frame-ancestors 'self' https://*.getsellia.com https://getsellia.com http://localhost:* http://127.0.0.1:* http://192.168.* https://*.vercel.app"
    );
  }

  return response;
}

function tryShopSubdomainRewrite(req: NextRequest): NextResponse | null {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") ?? "";
  const pathname = url.pathname;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return null;
  }

  let subdomain = "";
  const hostWithoutPort = hostname.split(":")[0] ?? "";

  if (hostWithoutPort.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = hostWithoutPort.replace(`.${ROOT_DOMAIN}`, "");
  } else if (hostWithoutPort.endsWith(".lvh.me")) {
    subdomain = hostWithoutPort.replace(".lvh.me", "");
  } else if (hostWithoutPort.endsWith(".localhost")) {
    subdomain = hostWithoutPort.replace(".localhost", "");
  }

  if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) {
    return null;
  }

  if (pathname.startsWith("/shop/")) {
    return null;
  }

  url.pathname = `/shop/${subdomain}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.rewrite(url);
  return applyShopEmbedHeaders(response, hostname);
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (
    url.pathname.match(/^\/shop\/[^/]+\/panier$/) &&
    url.searchParams.has("checkout")
  ) {
    const newUrl = url.clone();
    newUrl.pathname = url.pathname.replace("/panier", "/commander");
    newUrl.searchParams.delete("checkout");
    return NextResponse.redirect(newUrl);
  }

  if (url.pathname === "/panier" && url.searchParams.has("checkout")) {
    const hostname = req.headers.get("host") ?? "";
    const hostWithoutPort = hostname.split(":")[0] ?? "";
    let sub = "";
    if (hostWithoutPort.endsWith(`.${ROOT_DOMAIN}`))
      sub = hostWithoutPort.replace(`.${ROOT_DOMAIN}`, "");
    else if (hostWithoutPort.endsWith(".lvh.me"))
      sub = hostWithoutPort.replace(".lvh.me", "");
    else if (hostWithoutPort.endsWith(".localhost"))
      sub = hostWithoutPort.replace(".localhost", "");

    if (sub && !RESERVED_SUBDOMAINS.has(sub)) {
      const newUrl = url.clone();
      newUrl.pathname = "/commander";
      newUrl.searchParams.delete("checkout");
      return NextResponse.redirect(newUrl);
    }
  }

  const rewritten = tryShopSubdomainRewrite(req);
  if (rewritten) return rewritten;

  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get("sellia_session")?.value;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !sessionToken) {
    const url = new URL("/connexion", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && sessionToken && !pathname.startsWith("/verifier-email")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const hostname = req.headers.get("host") ?? "";
  const response = NextResponse.next();

  if (pathname.startsWith("/shop/")) {
    return applyShopEmbedHeaders(response, hostname);
  }

  return applyShopEmbedHeaders(response, hostname);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
