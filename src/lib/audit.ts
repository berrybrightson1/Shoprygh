import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export type ActivityAction =
    // Auth
    | "LOGIN"
    | "LOGOUT"
    // Store
    | "CREATE_STORE"
    | "DELETE_STORE"
    | "UPDATE_STORE_SETTINGS"
    // Products (Legacy & New)
    | "PRODUCT_CREATED" | "CREATE_PRODUCT"
    | "PRODUCT_UPDATED" | "UPDATE_PRODUCT"
    | "PRODUCT_DELETED"
    | "ARCHIVE_PRODUCT"
    | "STOCK_UPDATED" | "UPDATE_STOCK"
    | "INVENTORY_UPDATED"
    | "PRICE_UPDATED" | "UPDATE_PRICE"
    | "CATEGORY_UPDATED" | "UPDATE_CATEGORY"
    // Orders
    | "ORDER_CREATED"
    | "ORDER_UPDATED"
    | "ORDER_COMPLETED"
    | "ORDER_CANCELLED"
    | "ORDER_DELETED"
    // Customers
    | "CUSTOMER_CREATED"
    | "CUSTOMER_UPDATED"
    | "CUSTOMER_DELETED"
    // Settings
    | "PROFILE_UPDATED"
    | "SETTINGS_UPDATED"
    | "DELIVERY_ZONE_CREATED"
    | "DELIVERY_ZONE_UPDATED"
    | "DELIVERY_ZONE_DELETED"
    // Finance
    | "PAYOUT_REQUESTED"
    | "PAYOUT_CANCELLED"
    // Marketing
    | "COUPON_CREATED"
    | "COUPON_UPDATED"
    | "COUPON_DELETED"
    | "BROADCAST_SENT" | "BROADCAST"
    // Staff
    | "STAFF_INVITED"
    | "STAFF_REMOVED"
    | "STAFF_ROLE_UPDATED"
    // Other
    | "DATA_EXPORTED"
    | "UPDATE_PLAN"
    | "AI_DESCRIPTION_GENERATED";

/**
 * Log an activity/audit entry for the current user
 * Creates an immutable record of seller actions
 */
export async function logActivity(
    action: ActivityAction,
    description: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, unknown>
) {
    const session = await getSession();
    if (!session || !session.id) {
        console.warn(`[AUDIT] Cannot log activity - no user session (Keys: ${Object.keys(session || {}).join(', ')})`);
        return;
    }

    try {
        await prisma.auditLog.create({
            data: {
                userId: session.id, // Fixed: use session.id instead of session.userId
                action,
                description,
                entityType,
                entityId,
                metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined
            }
        });

        // Immutable console log for server monitoring
        console.log(`[AUDIT][${new Date().toISOString()}] ${action}: ${description}`);
    } catch (error) {
        console.error("[AUDIT] Failed to write audit log:", error);
        // Fail silently so we don't block the main action
    }
}
