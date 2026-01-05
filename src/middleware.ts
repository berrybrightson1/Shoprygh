import { createServerClient } from "@supabase/ssr";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
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
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session if expired
    await supabase.auth.getUser();

    // --- Existing Authorization Logic (Bridge) ---
    const { pathname } = request.nextUrl;

    // Allow platform-admin route
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
        return response; // Return the response with potential cookie updates
    }

    // Regex: Matches /something/admin...
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
                // Redirect to central login
                return NextResponse.redirect(new URL(`/login`, request.url));
            }
        }

        // 3. Prevent Login access if already logged in
        if (isLogin && session) {
            return NextResponse.redirect(new URL(`/${storeSlug}/admin/inventory`, request.url));
        }
    }

    return response;
}

export const config = {
    // Match all paths except static files and api
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

