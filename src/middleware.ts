import { createServerClient } from "@supabase/ssr";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
        // Only check Supabase Auth (Single Source of Truth)
        const { data: { user } } = await supabase.auth.getUser();

        const hasSession = !!user;

        // Log for debugging
        console.log(`[MW] Path: ${request.nextUrl.pathname} | User: ${!!user}`);

        // 4. Define Routes
        const url = request.nextUrl;
        const path = url.pathname;

        const isProtectedAdminRoute =
            (path.startsWith('/platform-admin')) ||
            (path.match(/^\/[^/]+\/admin/) !== null && !path.includes('/login'));

        // 5. Apply Redirection Logic

        // CASE: Protected Admin Route + NO Session -> Redirect to Login
        if (isProtectedAdminRoute && !hasSession) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', path); // Help them get back
            return NextResponse.redirect(loginUrl);
        }

        // Default -> Allow Request
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
