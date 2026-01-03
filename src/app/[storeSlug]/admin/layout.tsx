import AdminSidebar from "@/components/AdminSidebar";
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

    if (!store) return notFound();

    // Security Check: Ensure the logged-in user belongs to this store
    // We allow PLATFORM_ADMIN to access any store (optional, but good for support)
    if (session) {
        // Handle Stale Sessions (Migrating from old auth pattern)
        if (!session.storeSlug || !session.storeId) {
            // Session exists but lacks store data -> Force Re-login
            // We can't use the logout action directly here as it's a server component
            // So we redirect to a route that handles logout or just login which will overwrite
            redirect('/login');
        }

        // Check for matching store or Platform Admin privileges
        // We use !session.isPlatformAdmin because the 'role' field might be 'OWNER' even for platform admins
        if (session.storeId !== store.id && !session.isPlatformAdmin) {
            console.log(`[AdminLayout] Access Denied: User ${session.email} (Store: ${session.storeSlug}) tried to access ${storeSlug}`);
            redirect(`/${session.storeSlug}/admin/inventory`);
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans relative overflow-hidden text-gray-900 selection:bg-brand-cyan/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 blur-[130px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-400/20 blur-[130px]" />
                <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-cyan-400/10 blur-[100px]" />
            </div>

            {/* Sidebar (Client Component) - Only show if logged in */}
            {session && <AdminSidebar user={session} storeTier={store.tier} />}

            <main className={`flex-1 transition-all duration-300 relative z-10 ${session ? "ml-0 md:ml-72 pt-16 md:pt-0" : ""}`}>
                {children}
            </main>
        </div>
    );
}
