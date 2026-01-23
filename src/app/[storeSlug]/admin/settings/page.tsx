import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Components (Slots)
import SettingsShell from "./components/SettingsShell";
import GeneralSettings from "./components/GeneralSettings";
import AccountSettings from "./components/AccountSettings";
import BillingSettings from "./components/BillingSettings";
import ActivitySettings from "./components/ActivitySettings";
import DangerSettings from "./components/DangerSettings";

export default async function SettingsPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { storeSlug } = await params;

    // Fetch store details & Logs
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        select: {
            id: true,
            name: true,
            slug: true,
            tier: true,
            status: true,
            logo: true,
            ownerPhone: true,
            address: true,
            description: true,
        },
    });

    if (!store) redirect("/login");

    const logs = await prisma.auditLog.findMany({
        where: { userId: session.id },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } }
    });

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                    <Link
                        href={`/${storeSlug}/admin/inventory`}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-black transition mb-4 font-bold text-xs uppercase tracking-wide"
                    >
                        <ArrowLeft size={14} strokeWidth={3} />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                        Settings
                    </h1>
                </div>
            </header>

            {/* Client Shell takes over from here */}
            <SettingsShell
                GeneralSlot={<GeneralSettings store={store} />}
                AccountSlot={<AccountSettings session={session} />}
                BillingSlot={<BillingSettings store={store} />}
                ActivitySlot={<ActivitySettings logs={logs} />}
                DangerSlot={<DangerSettings />}
            />
        </div>
    );
}
