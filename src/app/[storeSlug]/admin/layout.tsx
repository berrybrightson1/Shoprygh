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

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Sidebar (Client Component) - Only show if logged in */}
            {session && <AdminSidebar user={session} storeTier={store.tier} />}

            <main className={`flex-1 transition-all duration-300 ${session ? "ml-0 md:ml-64 pt-16 md:pt-0" : ""}`}>
                {children}
            </main>
        </div>
    );
}
