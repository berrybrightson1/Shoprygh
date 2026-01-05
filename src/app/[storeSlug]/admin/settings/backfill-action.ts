"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * One-time backfill script to populate audit log with existing data
 * Creates historical records for existing products, orders, customers, coupons, and delivery zones
 */
export async function backfillAuditLogs() {
    const session = await getSession();
    if (!session || !session.storeId || !session.userId) {
        return { success: false, error: "Unauthorized" };
    }

    const storeId = session.storeId;
    const userId = session.userId;
    let totalCreated = 0;

    try {
        // 1. Backfill Products
        const products = await prisma.product.findMany({
            where: { storeId },
            select: { id: true, name: true, createdAt: true }
        });

        for (const product of products) {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: "PRODUCT_CREATED",
                    description: `[Historical] Product existed: ${product.name}`,
                    entityType: "PRODUCT",
                    entityId: product.id,
                    createdAt: product.createdAt // Use original creation date
                }
            });
            totalCreated++;
        }

        // 2. Backfill Orders
        const orders = await prisma.order.findMany({
            where: { storeId },
            select: { id: true, total: true, status: true, createdAt: true }
        });

        for (const order of orders) {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: "ORDER_CREATED",
                    description: `[Historical] Order #${order.id.slice(-6).toUpperCase()} - ₵${order.total}`,
                    entityType: "ORDER",
                    entityId: order.id,
                    createdAt: order.createdAt
                }
            });
            totalCreated++;
        }

        // 3. Backfill Customers
        const customers = await prisma.customer.findMany({
            where: { storeId },
            select: { id: true, name: true, createdAt: true }
        });

        for (const customer of customers) {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: "CUSTOMER_CREATED",
                    description: `[Historical] Customer existed: ${customer.name || 'Unknown'}`,
                    entityType: "CUSTOMER",
                    entityId: customer.id,
                    createdAt: customer.createdAt
                }
            });
            totalCreated++;
        }

        // 4. Backfill Coupons
        const coupons = await prisma.coupon.findMany({
            where: { storeId },
            select: { id: true, code: true, createdAt: true }
        });

        for (const coupon of coupons) {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: "COUPON_CREATED",
                    description: `[Historical] Coupon existed: ${coupon.code}`,
                    entityType: "COUPON",
                    entityId: coupon.id,
                    createdAt: coupon.createdAt
                }
            });
            totalCreated++;
        }

        // 5. Backfill Delivery Zones
        const zones = await prisma.deliveryZone.findMany({
            where: { storeId },
            select: { id: true, name: true, createdAt: true }
        });

        for (const zone of zones) {
            await prisma.auditLog.create({
                data: {
                    userId,
                    action: "DELIVERY_ZONE_CREATED",
                    description: `[Historical] Delivery zone existed: ${zone.name}`,
                    entityType: "DELIVERY_ZONE",
                    entityId: zone.id,
                    createdAt: zone.createdAt
                }
            });
            totalCreated++;
        }

        console.log(`[BACKFILL] Created ${totalCreated} historical audit logs for store ${storeId}`);

        return {
            success: true,
            message: `Backfilled ${totalCreated} historical records`,
            counts: {
                products: products.length,
                orders: orders.length,
                customers: customers.length,
                coupons: coupons.length,
                deliveryZones: zones.length
            }
        };
    } catch (error) {
        console.error("[BACKFILL] Error:", error);
        return { success: false, error: "Failed to backfill audit logs" };
    }
}
