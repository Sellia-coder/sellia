import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_MAINTENANCE_COOKIE } from "@/lib/maintenance/constants";

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
const AUTH_ROUTES = [
  "/connexion",
  "/inscription",
  "/verifier-email",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
];

/** Chemins toujours accessibles pendant la maintenance publique. */
const MAINTENANCE_EXEMPT_PREFIXES = [
  "/maintenance",
  "/admin",
  "/dashboard",
  "/api",
  "/_next",
  ...AUTH_ROUTES,
];

/**
 * En-têtes de sécurité (défense en profondeur). Volontairement SANS CSP stricte
 * (risque de casser pixels/Cloudflare/Next). X-Frame-Options est retiré ensuite
 * pour les sous-domaines boutique (embarquables en iframe par design).
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

function applyShopEmbedHeaders(
  response: NextResponse,
  hostname: string
): NextResponse {
  applySecurityHeaders(response);

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

function forwardWithPathname(
  req: NextRequest,
  pathname: string,
  hostname: string
): NextResponse {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  return applyShopEmbedHeaders(response, hostname);
}

function rewriteWithPathname(
  req: NextRequest,
  url: URL,
  pathname: string,
  hostname: string
): NextResponse {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);
  const response = NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
  return applyShopEmbedHeaders(response, hostname);
}

/**
 * Maintenance publique via cookie (pas de DB en edge).
 * Fail-safe : pas de cookie → site en ligne. En-têtes G10.B conservés.
 */
function tryPublicMaintenanceRedirect(req: NextRequest): NextResponse | null {
  try {
    const maintenanceOn =
      req.cookies.get(PUBLIC_MAINTENANCE_COOKIE)?.value === "1";
    if (!maintenanceOn) return null;

    const { pathname } = req.nextUrl;
    if (MAINTENANCE_EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) {
      return null;
    }

    const url = req.nextUrl.clone();
    url.pathname = "/maintenance";
    url.search = "";
    const response = NextResponse.redirect(url);
    return applyShopEmbedHeaders(response, req.headers.get("host") ?? "");
  } catch {
    return null;
  }
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
  return rewriteWithPathname(req, url, url.pathname, hostname);
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

  const maintRedirect = tryPublicMaintenanceRedirect(req);
  if (maintRedirect) return maintRedirect;

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
  return forwardWithPathname(req, pathname, hostname);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
