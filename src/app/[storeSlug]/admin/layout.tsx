import AdminSidebar from "@/components/AdminSidebar";
import AdminRightSidebar from "@/components/AdminRightSidebar";
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

    // Parallelize independent fetches
    const [store, latestUpdate] = await Promise.all([
        prisma.store.findUnique({
            where: { slug: storeSlug },
            select: { id: true, tier: true, logo: true, name: true } // Select Logo
        }),
        prisma.systemUpdate.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true }
        })
    ]);

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


    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-900 selection:bg-brand-cyan/30">
            {/* Background Gradients REMOVED for Performance */}

            {/* LEFT SIDEBAR - Navigation (Desktop & Mobile Drawer) */}
            <div className="h-full">
                {session && <AdminSidebar user={session} storeTier={store.tier} latestUpdateDate={latestUpdateDate} storeLogo={store.logo} storeName={store.name} />}
            </div>


            <div className="flex-1 flex overflow-hidden relative z-10 text-gray-900">
                {/* CENTER CONTENT */}
                {/* CENTER CONTENT */}
                <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-8 md:pt-8 no-scrollbar relative flex flex-col">

                    {children}
                </main>

                {/* RIGHT SIDEBAR - Profile & Activity */}
                {session && <AdminRightSidebar user={session} />}
            </div>
        </div>
    );
}
