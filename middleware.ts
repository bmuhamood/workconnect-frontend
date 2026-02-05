// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define user roles
type UserRole = 'worker' | 'employer' | 'admin' | 'super_admin';

// Define role permissions
const ROLE_PERMISSIONS = {
  worker: ['/dashboard', '/profile', '/settings', '/documents', '/contracts', '/payments'],
  employer: ['/dashboard', '/profile', '/settings', '/contracts', '/payments', '/jobs'],
  admin: ['/dashboard', '/admin', '/analytics', '/users', '/verifications', '/reports'],
  super_admin: ['*'] // Access to everything
};

// List of public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/register/worker',
  '/register/employer',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/verify-phone',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  '/community',
  '/safety',
  '/safety/*',
  '/help',
  '/faq',
  '/workers',
  '/workers/*', // Make sure this wildcard is included
  '/verification',
  '/pricing',
  '/features',
  '/blog',
  '/blog/*',
  '/success-stories',
  '/how-it-works',
  '/api/health',
  '/api/webhooks/*',
];

// List of protected routes (require authentication)
const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/*',
  '/profile',
  '/profile/*',
  '/settings',
  '/settings/*',
  '/documents',
  '/documents/*',
  '/contracts',
  '/contracts/*',
  '/payments',
  '/payments/*',
  '/notifications',
  '/notifications/*',
  '/messages',
  '/messages/*',
  '/jobs',
  '/jobs/*',
  '/applications',
  '/applications/*',
  '/reviews',
  '/reviews/*',
  '/wallet',
  '/wallet/*',
  '/subscription',
  '/subscription/*',
];

// Admin-only routes
const ADMIN_ROUTES = [
  '/admin',
  '/admin/*',
  '/analytics',
  '/analytics/*',
  '/users',
  '/users/*',
  '/verifications',
  '/verifications/*',
  '/reports',
  '/reports/*',
  '/system',
  '/system/*',
  '/moderation',
  '/moderation/*',
  '/billing',
  '/billing/*',
];

// Authentication pages
const AUTH_PAGES = [
  '/login',
  '/register',
  '/register/worker',
  '/register/employer',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Function to check if route is public
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    // Handle wildcard routes
    if (route.endsWith('/*')) {
      const baseRoute = route.replace('/*', '');
      return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
    }
    // Exact match
    return pathname === route;
  });
}

// Function to check if route is protected
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => {
    if (route.endsWith('/*')) {
      const baseRoute = route.replace('/*', '');
      return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

// Function to check if route is admin-only
function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => {
    if (route.endsWith('/*')) {
      const baseRoute = route.replace('/*', '');
      return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

// Function to check if route is auth page
function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.includes(pathname);
}

// Simple token validation (without jwt-decode)
function validateToken(token: string): { role: UserRole } | null {
  try {
    // Simple base64 decode for demonstration
    // In production, use a proper JWT library or verify with backend
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    return { role: payload.role || 'worker' };
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

// Function to check role-based permissions
function hasPermission(userRole: UserRole, pathname: string): boolean {
  // Super admin has access to everything
  if (userRole === 'super_admin') return true;
  
  // Get allowed routes for the role
  const allowedRoutes = ROLE_PERMISSIONS[userRole] || [];
  
  // Check if any allowed route matches the current path
  return allowedRoutes.some(route => {
    if (route === '*') return true;
    
    if (route.endsWith('/*')) {
      const baseRoute = route.replace('/*', '');
      return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
    }
    
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

// Main middleware function
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  
  // Check if route is public
  if (isPublicRoute(pathname)) {
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (token && isAuthPage(pathname)) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    // Allow access to public routes
    return NextResponse.next();
  }
  
  // Check if user has a token
  if (!token) {
    // Check if route requires authentication
    if (isProtectedRoute(pathname) || isAdminRoute(pathname)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'authentication_required');
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Validate token
  if (token) {
    const decodedToken = validateToken(token);
    
    if (!decodedToken) {
      // Token is invalid or expired
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      
      // Clear invalid tokens
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      
      loginUrl.searchParams.set('reason', 'session_expired');
      return response;
    }
    
    const userRole = decodedToken.role;
    
    // Check if user is trying to access auth pages while authenticated
    if (isAuthPage(pathname)) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    
    // Check admin route access
    if (isAdminRoute(pathname)) {
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        // Log unauthorized admin access attempt
        console.warn(`Unauthorized admin access attempt: ${userRole} trying to access ${pathname}`);
        
        // Redirect to dashboard with error message
        const dashboardUrl = new URL('/dashboard', request.url);
        dashboardUrl.searchParams.set('error', 'unauthorized_admin_access');
        return NextResponse.redirect(dashboardUrl);
      }
    }
    
    // Check role-based permissions for protected routes
    if (isProtectedRoute(pathname) && !hasPermission(userRole, pathname)) {
      // Log unauthorized access attempt
      console.warn(`Unauthorized access attempt: ${userRole} trying to access ${pathname}`);
      
      // Redirect to dashboard with error message
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'unauthorized_access');
      return NextResponse.redirect(dashboardUrl);
    }
  }
  
  // Add security headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP Header (Content Security Policy)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' http://localhost:* http://127.0.0.1:*",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // Add cache control for protected routes
  if (isProtectedRoute(pathname)) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  // Add cache control for public routes (allow caching)
  if (isPublicRoute(pathname)) {
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  }
  
  return response;
}

// Configure middleware matcher
export const config = {
  matcher: [
    '/((?!api/|_next/|_static/|_vercel|favicon.ico|sitemap.xml|robots.txt|public/).*)',
  ],
};