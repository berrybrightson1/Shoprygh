
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function logActivity(
    action: string,
    description: string,
    entityType?: string,
    entityId?: string,
    metadata?: any
) {
    const session = await getSession();
    if (!session || !session.id) return; // Cannot log anonymous actions for now

    try {
        await prisma.auditLog.create({
            data: {
                userId: session.id,
                action,
                description,
                entityType,
                entityId,
                metadata: metadata ? JSON.stringify(metadata) : undefined
            }
        });
    } catch (error) {
        console.error("Failed to write audit log:", error);
        // Fail silently so we don't block the main action
    }
}
