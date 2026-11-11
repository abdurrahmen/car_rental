import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { resilientFetch } from '@/lib/supabase/resilient-fetch';

const LOCALES = ['ar', 'fr', 'en'];
const DEFAULT_LOCALE = 'ar';

/** Protected route prefixes that require authentication */
const AUTH_ROUTES = ['/dashboard', '/staff', '/admin'];

/** Staff-only route prefixes */
const STAFF_ROUTES = ['/staff'];

/** Admin-only route prefixes */
const ADMIN_ROUTES = ['/admin'];

function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split('/');
  const potentialLocale = segments[1];
  if (LOCALES.includes(potentialLocale)) {
    return potentialLocale;
  }
  return null;
}

function getPreferredLocale(request: NextRequest): string {
  // Check cookie first
  const cookieLocale = request.cookies.get('preferred_locale')?.value;
  if (cookieLocale && LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLang = request.headers.get('Accept-Language') || '';
  for (const locale of LOCALES) {
    if (acceptLang.includes(locale)) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip internal paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  // Check if path has a locale prefix
  const pathLocale = getLocaleFromPath(pathname);

  // Redirect to locale-prefixed path if missing
  if (!pathLocale) {
    const locale = getPreferredLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Strip locale from the path for route checking
  const pathWithoutLocale = pathname.replace(`/${pathLocale}`, '') || '/';

  const isProtectedRoute = AUTH_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route),
  );
  const isStaffRoute = STAFF_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route),
  );
  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route),
  );

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Fast demo role bypass routing (DEVELOPMENT ONLY)
  const demoRole =
    process.env.NODE_ENV !== 'production'
      ? request.cookies.get('dzrent_demo_role')?.value
      : undefined;

  if (demoRole) {
    if (demoRole === 'admin') {
      return response;
    }
    if (['branch_manager', 'manager', 'staff'].includes(demoRole)) {
      if (isAdminRoute) {
        const url = request.nextUrl.clone();
        url.pathname = `/${pathLocale}/staff`;
        return NextResponse.redirect(url);
      }
      return response;
    }
    if (demoRole === 'customer') {
      if (isAdminRoute || isStaffRoute) {
        const url = request.nextUrl.clone();
        url.pathname = `/${pathLocale}/dashboard`;
        return NextResponse.redirect(url);
      }
      return response;
    }
  }

  // Check if any Supabase session cookies exist
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'),
  );

  // If route is public, return immediately without blocking on remote auth
  if (!isProtectedRoute) {
    return response;
  }

  // Protected route with no auth cookies: redirect to login immediately (0ms network cost)
  if (!hasAuthCookie) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${pathLocale}/login`;
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  // Protected route with auth cookies: verify with Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
      global: {
        fetch: resilientFetch,
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${pathLocale}/login`;
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For staff/admin routes, check role via profile or known admin credentials
  if (isStaffRoute || isAdminRoute) {
    if (user.email === 'admin@dzrent.dz') {
      return response;
    }

    let role = 'customer';
    if (user.email === 'manager.algiers@dzrent.dz') {
      role = 'branch_manager';
    } else if (user.email === 'staff.oran@dzrent.dz') {
      role = 'staff';
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role) {
        role = profile.role;
      }
    }

    if (isAdminRoute && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = `/${pathLocale}/dashboard`;
      return NextResponse.redirect(url);
    }

    if (
      isStaffRoute &&
      !['staff', 'branch_manager', 'admin'].includes(role)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = `/${pathLocale}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - static assets (.svg, .png, .jpg, .webp, fonts, 3d models)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|glb|gltf)).*)',
  ],
};
