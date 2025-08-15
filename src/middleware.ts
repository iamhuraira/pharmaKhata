// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
// import type { NextFetchEvent, NextRequest } from 'next/server';
// import createMiddleware from 'next-intl/middleware';
//
// import { AppConfig } from './utils/AppConfig';
//
// const intlMiddleware = createMiddleware({
//   locales: AppConfig.locales,
//   localePrefix: AppConfig.localePrefix,
//   defaultLocale: AppConfig.defaultLocale,
// });
//
// const isProtectedRoute = createRouteMatcher([
//   '/dashboard(.*)',
//   '/:locale/dashboard(.*)',
// ]);
//
// export default function middleware(
//   request: NextRequest,
//   event: NextFetchEvent,
// ) {
//   // Run Clerk middleware only when it's necessary
//   if (
//     request.nextUrl.pathname.includes('/sign-in')
//     || request.nextUrl.pathname.includes('/sign-up')
//     || isProtectedRoute(request)
//   ) {
//     return clerkMiddleware((auth, req) => {
//       if (isProtectedRoute(req)) {
//         const locale
//           = req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';
//
//         const signInUrl = new URL(`${locale}/sign-in`, req.url);
//         console.log('signInUrl', signInUrl);
//
//
//         // auth().protect({
//         //   // `unauthenticatedUrl` is needed to avoid error: "Unable to find `next-intl` locale because the middleware didn't run on this request"
//         //   unauthenticatedUrl: signInUrl.toString(),
//         // });
//       }
//
//       return intlMiddleware(req);
//     })(request, event);
//   }
//
//   return intlMiddleware(request);
// }
//
// export const config = {
//   matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'], // Also exclude tunnelRoute used in Sentry from the matcher
// };

import { type NextRequest, NextResponse } from 'next/server';

const isProtectedRoute = (pathname: string) => {
  const protectedRoutes = [/^\/dashboard(.*)/];
  return protectedRoutes.some((route) => route.test(pathname));
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token");
  const emailVerified: string =
    request.cookies.get("emailVerified")?.value || "false";
  const FPEamil = request.cookies.get("FPEmail");
  const VFEamil = request.cookies.get("VFEmail");
  const allowChangePassword = request.cookies.get("allowChangePassword");
  const passwordUpdated = request.cookies.get("passwordUpdated");
  if (isProtectedRoute(pathname) && (!token || emailVerified !== 'true')) {
    const signInUrl = new URL('/sign-in', request.url);

    return NextResponse.redirect(signInUrl.toString());
  }
  if (
    (request.nextUrl.pathname === '/sign-in' ||
      request.nextUrl.pathname === '/') &&
    token &&
    emailVerified === 'true'
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (request.nextUrl.pathname === '/otp-verification' && !FPEamil) {
    const signInUrl = new URL('/sign-in', request.url);

    return NextResponse.redirect(signInUrl.toString());
  }
  if (request.nextUrl.pathname === '/change-password' && !allowChangePassword) {
    const signInUrl = new URL('/sign-in', request.url);

    return NextResponse.redirect(signInUrl.toString());
  }
  if (request.nextUrl.pathname === '/password-updated' && !passwordUpdated) {
    const signInUrl = new URL('/sign-in', request.url);

    return NextResponse.redirect(signInUrl.toString());
  }
  if (request.nextUrl.pathname === '/verify-email' && !VFEamil) {
    const signInUrl = new URL('/sign-in', request.url);

    return NextResponse.redirect(signInUrl.toString());
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/change-password",
    "/forgot-password",
    "/otp-verification",
    "/password-updated",
    "/sign-in",
    "/sign-up",
    "/verify-email",
    "/verify-tfa",
    "/about",
    "/privacy",
    "/terms-and-conditions",
    "/cookie-policy",
    "/contact-us",
    "/blogs/:path*",
  ], // Also exclude tunnelRoute used in Sentry from the matcher
};
