import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const cookie = request.cookies.get('session')?.value;
    const session = cookie ? await decrypt(cookie) : null;

    // 2. Protect Admin Routes
    if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // 3. Prevent Login access if already logged in
    if (request.nextUrl.pathname.startsWith('/admin/login') && session) {
        return NextResponse.redirect(new URL('/admin/inventory', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
