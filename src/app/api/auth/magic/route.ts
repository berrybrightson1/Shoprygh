// Magic Link Auto-Login for Platform Admin
// URL: /api/auth/magic?token=SUPER_ADMIN_ACCESS

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { encrypt } from '@/lib/auth'

// Secret token for super admin access (in production, use environment variable)
const MAGIC_TOKEN = process.env.ADMIN_MAGIC_TOKEN || 'SUPER_ADMIN_ACCESS'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    // Validate token
    if (token !== MAGIC_TOKEN) {
        return NextResponse.json({ error: 'Invalid magic link' }, { status: 401 })
    }

    try {
        // Find the platform admin
        const admin = await prisma.user.findFirst({
            where: { isPlatformAdmin: true },
            include: { store: true }
        })

        if (!admin || !admin.store) {
            return NextResponse.json({ error: 'No platform admin found' }, { status: 404 })
        }

        // Create session
        const session = await encrypt({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            isPlatformAdmin: admin.isPlatformAdmin,
            storeId: admin.store.id,
            storeSlug: admin.store.slug
        })

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set('session', session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            path: '/',
        })

        console.log(`[MAGIC_LINK] Admin ${admin.email} logged in via magic link`)

        // Redirect to platform admin dashboard
        return NextResponse.redirect(new URL('/platform-admin', request.url))

    } catch (error) {
        console.error('[MAGIC_LINK] Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
