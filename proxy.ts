import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

  // Create a Supabase client to check auth
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

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
    },
  );

  // Refresh the auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if the route requires authentication
  const isProtectedRoute = AUTH_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route),
  );

  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${pathLocale}/login`;
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For staff/admin routes, check role via profile
  if (user) {
    const isStaffRoute = STAFF_ROUTES.some((route) =>
      pathWithoutLocale.startsWith(route),
    );
    const isAdminRoute = ADMIN_ROUTES.some((route) =>
      pathWithoutLocale.startsWith(route),
    );

    if (isStaffRoute || isAdminRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (isAdminRoute && profile?.role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = `/${pathLocale}/dashboard`;
        return NextResponse.redirect(url);
      }

      if (
        isStaffRoute &&
        !['staff', 'branch_manager', 'admin'].includes(profile?.role || '')
      ) {
        const url = request.nextUrl.clone();
        url.pathname = `/${pathLocale}/dashboard`;
        return NextResponse.redirect(url);
      }
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
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
