import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Dashboard Protection: Agar login token nahi hai, to dashboard access block karein
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Auth Pages: Agar user pehle se logged in hai, to use login/register page par na jaane dein
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// In URLs par middleware apply hoga
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
