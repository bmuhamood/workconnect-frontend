// middleware.ts - FIXED VERSION
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Get token and user role from cookies
  const token = request.cookies.get('access_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  
  console.log(`Middleware: Path=${pathname}, HasToken=${!!token}, Role=${userRole || 'none'}`);

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // PUBLIC ROUTES
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/register/worker',
    '/register/employer',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-phone',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/help',
    '/workers',
    '/workers/[id]', 
    '/faq',
    '/workers',
    '/pricing',
    '/features',
    '/blog',
    '/how-it-works',
    '/jobs',
    '/jobs/[id]',
  ];
  
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes('[id]')) {
      const routePattern = route.replace('[id]', '[^/]+');
      return new RegExp(`^${routePattern}$`).test(pathname);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  // Auth routes (login/register pages)
  const authRoutes = ['/login', '/register', '/register/worker', '/register/employer'];
  const isAuthRoute = authRoutes.includes(pathname);

  // Protected routes - ONLY /dashboard, NOT role-specific subpaths
  const protectedRoutes = [
    '/dashboard',  // ✅ Keep only this - your single dashboard page
    '/profile',
    '/settings',
    '/documents',
    '/contracts',
    '/payments',
    '/messages',
    '/notifications',
    '/applications',
    '/saved-jobs',
    '/post-job',
  ];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Admin routes
  const adminRoutes = ['/admin', '/analytics', '/users', '/verifications', '/reports'];
  const isAdminRoute = adminRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // 🔴 CRITICAL FIX: Don't redirect /dashboard to role-specific URLs
  // Your /dashboard page already handles role-based rendering internally
  
  // If trying to access protected/admin route without token
  if ((isProtectedRoute || isAdminRoute) && !token) {
    console.log(`No token, redirecting to login from ${pathname}`);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('reason', 'authentication_required');
    return NextResponse.redirect(loginUrl);
  }

  // If has token and trying to access auth route (login/register)
  if (token && isAuthRoute) {
    console.log(`Authenticated, redirecting to dashboard from ${pathname}`);
    // ✅ Redirect to /dashboard, NOT /dashboard/employer or /dashboard/worker
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};