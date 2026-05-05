import { NextRequest, NextResponse } from "next/server";
import { APP_BASE_PATH, ROUTES } from "@/shared/constants/routes";
import { SESSION_CONFIG, verifySessionToken } from "@/shared/auth/session-token";

const PUBLIC_PATHS: Set<string> = new Set([
  ROUTES.login,
  ROUTES.onboarding,
  ROUTES.apiLogin,
  ROUTES.apiCheckEmail,
  ROUTES.apiSignup,
  ROUTES.apiLogout,
]);

/** Pathname as seen by the app (without /app basePath prefix) */
function appPathname(pathname: string) {
  if (pathname === APP_BASE_PATH || pathname === `${APP_BASE_PATH}/`) return "/";
  if (pathname.startsWith(`${APP_BASE_PATH}/`)) return pathname.slice(APP_BASE_PATH.length);
  return pathname;
}

function isPublicCredentialDetailPath(pathname: string) {
  return /^\/credentials-cloud\/credentials\/[^/]+$/.test(pathname);
}

function isAssetPath(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/assets") ||
    /\.(svg|png|jpe?g|gif|webp|ico|txt|xml|woff2?)$/i.test(pathname)
  );
}

function redirectToAppRoute(request: NextRequest, route: string) {
  const url = request.nextUrl.clone();
  const path = route.startsWith("/") ? route : `/${route}`;
  url.pathname = `${APP_BASE_PATH}${path}`;
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const pathname = appPathname(request.nextUrl.pathname);

  if (isAssetPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_CONFIG.cookieName)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname === ROUTES.login) {
    if (session) {
      return redirectToAppRoute(request, ROUTES.dashboard);
    }
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (isPublicCredentialDetailPath(pathname)) {
    return NextResponse.next();
  }

  /*
  if (!session) {
    return redirectToAppRoute(request, ROUTES.login);
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
