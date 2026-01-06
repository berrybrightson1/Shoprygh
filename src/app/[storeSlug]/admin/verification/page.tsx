import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import VerificationClient from "./VerificationClient";

export default async function VerificationPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const store = await prisma.store.findUnique({
        where: { id: session.storeId },
        select: {
            id: true,
            name: true,
            isVerified: true,
            tier: true,
            verificationStatus: true
        }
    });

    if (!store) redirect("/login");

    // Calculate Real Progress Stats
    const totalSales = await prisma.order.count({
        where: {
            storeId: store.id,
            status: "COMPLETED" // Ensure this matches your OrderStatus enum!
        }
    });

    // Mock Ship Time (Since we don't have detailed shipping logs yet)
    // In future, this would be avg(deliveredAt - paidAt)
    const avgShipTime = 22; // Hardcoded "good" value for now to encourage them

    // Check Identity (Mock logic: if they have a phone, counts as partial identity)
    const owner = await prisma.user.findFirst({
        where: { storeId: store.id, role: "OWNER" }
    });
    const identityVerified = !!owner?.phone;

    const stats = {
        sales: totalSales,
        salesGoal: 50, // Goal to reach "Standard" verification
        shipTime: avgShipTime,
        shipTimeGoal: 24,
        identityVerified: identityVerified
    };

    return <VerificationClient store={store} stats={stats} />;
}
