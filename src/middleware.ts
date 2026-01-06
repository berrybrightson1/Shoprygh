import { createServerClient } from "@supabase/ssr";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    try {
        // 1. Initialize Response
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        // 2. Setup Supabase Client (Handles Auth Cookie Refresh)
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

        // 3. Validate Session State
        // We check Supabase Auth (Primary) AND our custom session cookie (Role/Store info)
        const { data: { user } } = await supabase.auth.getUser();

        const customSessionCookie = request.cookies.get('session')?.value;
        let customSession = null;
        if (customSessionCookie) {
            try {
                customSession = await decrypt(customSessionCookie);
            } catch (e) {
                // Invalid or expired custom cookie
            }
        }

        // Strict Check: Both must exist to be considered "Fully Logged In"
        const hasSession = !!user && !!customSession;

        // Log for debugging (safe to remove later)
        console.log(`[MW] Path: ${request.nextUrl.pathname} | User: ${!!user} | CustomSession: ${!!customSession} | HasSession: ${hasSession}`);

        // 4. Define Routes
        const url = request.nextUrl;
        const path = url.pathname;

        const isPublicAuthRoute = path === '/login' || path === '/signup';

        const isProtectedAdminRoute =
            (path.startsWith('/platform-admin')) ||
            (path.match(/^\/[^/]+\/admin/) !== null && !path.includes('/login'));

        // 5. Apply Redirection Logic

        // CASE A: Public Route + Session -> Redirect to Dashboard
        // DISABLE AUTO-REDIRECT TO PREVENT LOOPS:
        // If there's a session mismatch (Client vs Server), this sends them to dashboard, 
        // which sends them back to login, creating a loop.
        // Better to let them see the login page (or a "Go to Dashboard" button) if state is wonky.
        /*
        if (isPublicAuthRoute && hasSession) {
            const destUrl = new URL(request.url);
            if (customSession?.isPlatformAdmin) {
                destUrl.pathname = '/platform-admin';
            } else if (customSession?.storeSlug) {
                destUrl.pathname = `/${customSession.storeSlug}/admin/inventory`;
            } else {
                return response;
            }
            return NextResponse.redirect(destUrl);
        }
        */

        // CASE B: Protected Admin Route + NO Session -> Redirect to Login
        if (isProtectedAdminRoute && !hasSession) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', path); // Help them get back
            return NextResponse.redirect(loginUrl);
        }

        // CASE C: Default -> Allow Request
        return response;

    } catch (error: any) {
        // CATCH-ALL ERROR HANDLER
        return new NextResponse(JSON.stringify({ error: error.message, stack: error.stack }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
        });
    }
}

export const config = {
    matcher: [
        '/((?!api|_next|static|favicon.ico).*)',
    ],
};
