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
  ],
};
