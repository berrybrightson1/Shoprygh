import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import VerificationClient from "./VerificationClient";
import SettingsLayout from "@/components/admin/SettingsLayout";

export default async function VerificationPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;
    const session = await getSession();
    if (!session) redirect("/login");

    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        select: {
            id: true,
            name: true,
            isVerified: true,
            tier: true,
            verificationStatus: true
        }
    });

    if (!store) redirect("/login");

    // Authorization check
    if (store.id !== session.storeId && !session.isPlatformAdmin) {
        redirect(`/${storeSlug}/admin`);
    }

    // Calculate Real Progress Stats
    const totalSales = await prisma.order.count({
        where: {
            storeId: store.id,
            status: "COMPLETED"
        }
    });

    const avgShipTime = 22;

    // Check Identity
    const owner = await prisma.user.findFirst({
        where: { storeId: store.id, role: "OWNER" }
    });
    const identityVerified = !!owner?.phone;

    const stats = {
        sales: totalSales,
        salesGoal: 50,
        shipTime: avgShipTime,
        shipTimeGoal: 24,
        identityVerified: identityVerified
    };

    return (
        <SettingsLayout
            storeSlug={storeSlug}
            activeTab="verification"
            title={
                <div className="flex items-center gap-3">
                    Verification Center
                    {store.isVerified && <BadgeCheck className="text-blue-500 fill-blue-100" size={24} />}
                </div>
            }
            description="Build trust and boost sales with the Blue Tick."
        >
            <VerificationClient store={store} stats={stats} />
        </SettingsLayout>
    );
}
