import prisma from "@/lib/prisma";

type LogAction = {
    userId: string;
    action: string;
    description?: string;
    metadata?: Record<string, any>;
    entityId?: string;
    entityType?: string; // "STORE" | "PRODUCT" | "ORDER"
};

/**
 * Logs a critical system activity to the immutable audit log.
 * Usage: await logActivity({ userId: user.id, action: "LOGIN", description: "User logged in" });
 */
export async function logActivity({ userId, action, description, metadata, entityId, entityType }: LogAction) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                description,
                metadata, // Prisma handles JSON serialization
                entityId,
                entityType
            }
        });
        // We do not await this logging in critical paths if we don't want to block, 
        // but for reliability, it's often safer to await it.
    } catch (error) {
        // Silently fail to avoid breaking the main application flow
        console.error("FAILED TO LOG ACTIVITY:", error);
    }
}
