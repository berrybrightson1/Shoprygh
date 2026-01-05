// Reset Database Script - Creates fresh super admin
// Run with: npx tsx prisma/reset-accounts.ts

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Starting account reset...')

    try {
        // 1. Delete all audit logs first (due to foreign key)
        const deletedLogs = await prisma.auditLog.deleteMany({})
        console.log(`✓ Deleted ${deletedLogs.count} audit logs`)

        // 2. Delete all users
        const deletedUsers = await prisma.user.deleteMany({})
        console.log(`✓ Deleted ${deletedUsers.count} users`)

        // 3. Get the first store (or create one if none exist)
        let store = await prisma.store.findFirst()

        if (!store) {
            store = await prisma.store.create({
                data: {
                    name: 'Anaya Baby Care',
                    slug: 'anaya',
                    tier: 'HUSTLER',
                    status: 'ACTIVE',
                }
            })
            console.log('✓ Created default store: Anaya Baby Care')
        } else {
            console.log(`✓ Using existing store: ${store.name} (${store.slug})`)
        }

        // 4. Create Super Admin with a simple password
        const hashedPassword = await hash('admin123', 10)

        const superAdmin = await prisma.user.create({
            data: {
                email: 'admin@shopry.app',
                password: hashedPassword,
                name: 'Platform Admin',
                role: 'OWNER',
                isPlatformAdmin: true,
                storeId: store.id,
            }
        })

        console.log('')
        console.log('✅ RESET COMPLETE!')
        console.log('═══════════════════════════════════════')
        console.log('Super Admin Account:')
        console.log('  Email:    admin@shopry.app')
        console.log('  Password: admin123')
        console.log('  Store:    ' + store.name + ' (' + store.slug + ')')
        console.log('')
        console.log('Magic Link (auto-login):')
        console.log(`  http://localhost:3005/api/auth/magic?token=SUPER_ADMIN_ACCESS`)
        console.log('═══════════════════════════════════════')

    } catch (error) {
        console.error('Error during reset:', error)
        throw error
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
