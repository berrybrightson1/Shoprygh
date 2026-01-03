import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow platform-admin route (requires login but different check)
    if (pathname.startsWith('/platform-admin')) {
        const cookie = request.cookies.get('session')?.value;
        let session = null;
        try {
            session = cookie ? await decrypt(cookie) : null;
        } catch (e) {
            // Invalid token
        }

        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.next();
    }

    // Regex: Matches /something/admin...
    // Captures the store slug in group 1
    const adminRegex = /^\/([^/]+)\/admin/;
    const match = pathname.match(adminRegex);

    if (match) {
        const storeSlug = match[1];
        const isLogin = pathname.startsWith(`/${storeSlug}/admin/login`);

        const cookie = request.cookies.get('session')?.value;
        let session = null;
        try {
            session = cookie ? await decrypt(cookie) : null;
        } catch (e) {
            // Invalid token
        }

        // 2. Protect Admin Routes
        if (!isLogin) {
            if (!session) {
                // Redirect to central login instead of /anaya-store/admin/login
                // We could pass a 'next' param if we wanted deep linking later
                return NextResponse.redirect(new URL(`/login`, request.url));
            }
        }

        // 3. Prevent Login access if already logged in
        if (isLogin && session) {
            return NextResponse.redirect(new URL(`/${storeSlug}/admin/inventory`, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Match all paths except static files and api
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
