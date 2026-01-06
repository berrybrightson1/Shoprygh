import AdminSidebar from "@/components/AdminSidebar";
import AdminRightSidebar from "@/components/AdminRightSidebar";
import MobileNavigation from "@/components/MobileNavigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";


export default async function AdminLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ storeSlug: string }>
}) {
    const session = await getSession();
    const { storeSlug } = await params;

    // Fetch store info for Tier
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug }
    });

    const latestUpdate = await prisma.systemUpdate.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
    });

    if (!store) return notFound();

    // Security Check
    if (session) {
        if (!session.storeSlug || !session.storeId) redirect('/login');
        if (session.storeId !== store.id && !session.isPlatformAdmin) {
            redirect(`/${session.storeSlug}/admin/inventory`);
        }
    }

    // Serialize Date for Client Component
    const latestUpdateDate = latestUpdate?.createdAt ? latestUpdate.createdAt.toISOString() : undefined;

    // Fetch Logs for the Right Sidebar - Store Wide
    let recentLogs: any[] = [];
    if (session?.id) {
        const rawLogs = await prisma.auditLog.findMany({
            where: {
                user: {
                    storeId: store.id
                }
            },
            take: 20,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { name: true, image: true, email: true } } }
        });

        // Serialize Logs
        recentLogs = rawLogs.map(log => ({
            ...log,
            createdAt: log.createdAt.toISOString()
        }));
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-900 selection:bg-brand-cyan/30">
            {/* Background Gradients (Fixed Global) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/10 blur-[130px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-400/10 blur-[130px]" />
            </div>

            {/* LEFT SIDEBAR - Navigation (Desktop Only) */}
            <div className="hidden md:flex h-full">
                {session && <AdminSidebar user={session} storeTier={store.tier} latestUpdateDate={latestUpdateDate} />}
            </div>

            {/* MOBILE NAVIGATION */}
            <MobileNavigation storeSlug={storeSlug} />

            <div className="flex-1 flex overflow-hidden relative z-10 text-gray-900">
                {/* CENTER CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 no-scrollbar relative flex flex-col">

                    {children}
                </main>

                {/* RIGHT SIDEBAR - Profile & Activity */}
                {session && <AdminRightSidebar user={session} logs={recentLogs} />}
            </div>
        </div>
    );
}
