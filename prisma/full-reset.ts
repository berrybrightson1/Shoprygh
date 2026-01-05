// FULL DATABASE RESET - Delete EVERYTHING, Platform Admin without store
// Run with: npx tsx prisma/full-reset.ts

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🔥 FULL DATABASE RESET...')
    console.log('═══════════════════════════════════════')

    // Delete ALL data in dependency order
    console.log('\n1. Deleting all order items...')
    await prisma.orderItem.deleteMany({})

    console.log('2. Deleting all orders...')
    await prisma.order.deleteMany({})

    console.log('3. Deleting all customers...')
    await prisma.customer.deleteMany({})

    console.log('4. Deleting all products...')
    await prisma.product.deleteMany({})

    console.log('5. Deleting all coupons...')
    await prisma.coupon.deleteMany({})

    console.log('6. Deleting all delivery zones...')
    await prisma.deliveryZone.deleteMany({})

    console.log('7. Deleting all wallet transactions...')
    await prisma.walletTransaction.deleteMany({})

    console.log('8. Deleting all payout requests...')
    await prisma.payoutRequest.deleteMany({})

    console.log('9. Deleting all subscriptions...')
    await prisma.subscription.deleteMany({})

    console.log('10. Deleting all audit logs...')
    await prisma.auditLog.deleteMany({})

    console.log('11. Deleting all users...')
    await prisma.user.deleteMany({})

    console.log('12. Deleting all stores...')
    await prisma.store.deleteMany({})

    console.log('\n✓ All data deleted!')

    // Create Platform Admin WITHOUT a store
    console.log('\n13. Creating Platform Admin (independent, no store)...')
    const hashedPassword = await hash('admin123', 10)

    await prisma.user.create({
        data: {
            email: 'admin@shopry.app',
            password: hashedPassword,
            name: 'Platform Admin',
            role: 'PLATFORM_ADMIN',
            isPlatformAdmin: true,
            storeId: null, // NO STORE - Independent admin!
        }
    })

    console.log('')
    console.log('═══════════════════════════════════════')
    console.log('🎉 FRESH START COMPLETE!')
    console.log('═══════════════════════════════════════')
    console.log('')
    console.log('Stores: 0 (clean slate)')
    console.log('')
    console.log('Platform Admin (independent):')
    console.log('  Email:    admin@shopry.app')
    console.log('  Password: admin123')
    console.log('')
    console.log('Magic Link (no password):')
    console.log('  http://localhost:3005/api/auth/magic?token=SUPER_ADMIN_ACCESS')
    console.log('')
    console.log('═══════════════════════════════════════')
}

main()
    .catch(e => {
        console.error('Error:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
