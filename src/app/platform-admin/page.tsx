import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { AlertCircle, CheckCircle, Ban, Store, Sparkles, Wallet } from "lucide-react";
import StoreList from "./StoreList";
import DashboardShell from "./DashboardShell";

// Platform Admin Dashboard
export default async function PlatformAdminPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    // Check if user is platform admin
    const user = await prisma.user.findUnique({
        where: { email: session.email },
        select: { isPlatformAdmin: true, name: true, image: true },
    });

    if (!user?.isPlatformAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You do not have Platform Admin privileges.</p>
                    <Link href="/" className="mt-6 inline-block text-brand-orange hover:underline font-bold">
                        Go to Homepage
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch all stores
    const rawStores = await prisma.store.findMany({
        include: {
            users: {
                where: { role: "OWNER" },
                select: { name: true, email: true },
            },
            _count: {
                select: { products: true, orders: true, users: true },
            },
            verificationStatus: true,
        },
        orderBy: { createdAt: "desc" },
    });

    // Serialize Decimal types for Client Components
    const stores = rawStores.map(store => ({
        ...store,
        walletBalance: store.walletBalance ? Number(store.walletBalance) : 0,
    }));

    // --- AUTO UPDATE LOGIC ---
    let currentVersion = "1.0.0";
    try {
        const packageJson = await import("../../../package.json");
        currentVersion = packageJson.version;
    } catch (error) {
        console.warn("[PlatformAdmin] Could not load package.json version:", error);
    }

    const latestUpdate = await prisma.systemUpdate.findFirst({
        orderBy: { createdAt: "desc" },
        select: { version: true }
    });

    if (currentVersion && (!latestUpdate || latestUpdate.version !== currentVersion)) {
        const existingVersion = await prisma.systemUpdate.findFirst({
            where: { version: currentVersion }
        });

        if (!existingVersion) {
            console.log(`[AutoUpdate] New version detected: ${currentVersion}. Posting update...`);
            await prisma.systemUpdate.create({
                data: {
                    title: `System Update v${currentVersion}`,
                    version: currentVersion,
                    content: "• UI Polishing: Improved layout spacing for Admin Store List.\\n• Modernization: Replaced legacy alerts with modern toast notifications.\\n• Security: Enhanced confirmation flows for critical actions.\\n• Fixes: Resolved coupon validation and build issues.",
                    type: "UPDATE"
                }
            });
        }
    }

    // --- ANALYTICS ---
    const revenueAgg = await prisma.order.aggregate({
        _sum: { total: true }
    });
    const totalRevenue = revenueAgg._sum.total ? Number(revenueAgg._sum.total) : 0;

    const stats = {
        total: stores.length,
        active: stores.filter((s) => s.status === "ACTIVE").length,
        suspended: stores.filter((s) => s.status === "SUSPENDED").length,
        hustler: stores.filter((s) => s.tier === "HUSTLER").length,
        pro: stores.filter((s) => s.tier === "PRO").length,
        wholesaler: stores.filter((s) => s.tier === "WHOLESALER").length,
    };

    // Fetch audit logs
    const logs = await prisma.auditLog.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true, image: true } } }
    });

    return (
        <DashboardShell session={session} user={user} logs={logs as any}>
            <div className="p-8 pl-20">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hello, Super Admin</h1>
                        <p className="text-gray-500 mt-1 font-medium">Here is what is happening across the platform today.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/platform-admin/updates" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold shadow-lg hover:opacity-90 transition flex items-center gap-2">
                            <Sparkles size={16} /> Post Update
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Card */}
                    <div className="xl:col-span-2 bg-gradient-to-br from-black to-gray-900 rounded-[24px] p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="relative z-10">
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Platform Revenue</p>
                            <h2 className="text-5xl font-black tracking-tight mb-4">
                                ₵{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h2>
                            <div className="flex gap-2">
                                <span className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white/90">
                                    +12% vs last month
                                </span>
                            </div>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-40px] opacity-10 rotate-12">
                            <Wallet size={200} />
                        </div>
                    </div>

                    {/* Mini Stats Column */}
                    <div className="space-y-4">
                        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase">Total Stores</p>
                                <p className="text-2xl font-black text-gray-900">{stats.total}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                <Store size={20} />
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase">Active Subs</p>
                                <p className="text-2xl font-black text-gray-900">{stats.pro + stats.wholesaler}</p>
                            </div>
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle size={20} />
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase">Suspended</p>
                                <p className="text-2xl font-black text-gray-900">{stats.suspended}</p>
                            </div>
                            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                                <Ban size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* All Stores Table */}
                <div className="bg-white rounded-[24px] border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 text-lg">All Stores</h3>
                    </div>
                    <StoreList stores={stores as any} />
                </div>
            </div>
        </DashboardShell>
    );
}
