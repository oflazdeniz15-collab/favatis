import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if it exists
    const { data: { session } } = await supabase.auth.getSession();

    // Protect dashboard and admin routes
    const protectedPaths = ['/dashboard', '/admin', '/artist'];
    const isProtectedPath = protectedPaths.some(path =>
        req.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath && !session) {
        const redirectUrl = new URL('/auth/signin', req.url);
        redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Admin-only routes
    if (req.nextUrl.pathname.startsWith('/admin') && session) {
        // Check if user is admin (would need to fetch profile)
        // For now, allow access and check in the component
    }

    return res;
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',
        '/artist/:path*',
    ],
};
