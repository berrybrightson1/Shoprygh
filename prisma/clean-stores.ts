// Clean up old stores - Keep only Akpene Store
// Run with: npx tsx prisma/clean-stores.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧹 Cleaning old stores...')

    // Find the store to keep (the one with our platform admin)
    const keepStore = await prisma.store.findFirst({
        where: {
            users: {
                some: { isPlatformAdmin: true }
            }
        }
    })

    if (!keepStore) {
        console.error('❌ No store with platform admin found!')
        return
    }

    console.log(`✓ Keeping store: ${keepStore.name} (${keepStore.slug})`)

    // Get all other stores
    const storesToDelete = await prisma.store.findMany({
        where: {
            id: { not: keepStore.id }
        },
        select: { id: true, name: true, slug: true }
    })

    console.log(`Found ${storesToDelete.length} stores to delete:`)
    storesToDelete.forEach(s => console.log(`  - ${s.name} (${s.slug})`))

    // Delete related data for each store
    for (const store of storesToDelete) {
        console.log(`\nDeleting ${store.name}...`)

        // Delete in order of dependencies
        await prisma.orderItem.deleteMany({ where: { order: { storeId: store.id } } })
        await prisma.order.deleteMany({ where: { storeId: store.id } })
        await prisma.customer.deleteMany({ where: { storeId: store.id } })
        await prisma.product.deleteMany({ where: { storeId: store.id } })
        await prisma.category.deleteMany({ where: { storeId: store.id } })
        await prisma.deliveryZone.deleteMany({ where: { storeId: store.id } })
        await prisma.coupon.deleteMany({ where: { storeId: store.id } })
        await prisma.walletTransaction.deleteMany({ where: { storeId: store.id } })
        await prisma.payoutRequest.deleteMany({ where: { storeId: store.id } })
        await prisma.user.deleteMany({ where: { storeId: store.id } })

        // Finally delete the store
        await prisma.store.delete({ where: { id: store.id } })
        console.log(`  ✓ Deleted ${store.name}`)
    }

    console.log('')
    console.log('═══════════════════════════════════════')
    console.log('🎉 Cleanup complete!')
    console.log(`Only ${keepStore.name} remains.`)
    console.log('═══════════════════════════════════════')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
