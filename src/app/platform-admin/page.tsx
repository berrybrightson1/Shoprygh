import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Shield, AlertCircle, CheckCircle, Ban, Store, Sparkles, Wallet } from "lucide-react";
import StoreActions from "./StoreActions";

// Platform Admin Dashboard - Force rebuild
export default async function PlatformAdminPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    // Check if user is platform admin
    const user = await prisma.user.findUnique({
        where: { email: session.email },
        select: { isPlatformAdmin: true },
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
    const stores = await prisma.store.findMany({
        include: {
            users: {
                where: { role: "OWNER" },
                select: { name: true, email: true },
            },
            _count: {
                select: { products: true, orders: true, users: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // --- AUTO UPDATE LOGIC ---
    // 1. Get Current App Version from package.json
    let currentVersion = "1.0.0";
    try {
        // We import it this way server-side to avoid bundling issues
        // Use a relative path that works in both dev and prod if possible, 
        // or strictly catching the error if it fails
        const packageJson = await import("../../../package.json");
        currentVersion = packageJson.version;
    } catch (error) {
        console.warn("[PlatformAdmin] Could not load package.json version:", error);
    }
    // const currentVersion = packageJson.version; // e.g., "1.1.0"

    // 2. Get Latest Update from DB
    const latestUpdate = await prisma.systemUpdate.findFirst({
        orderBy: { createdAt: "desc" },
        select: { version: true }
    });

    // 3. Compare and Auto-Post if needed
    if (currentVersion && (!latestUpdate || latestUpdate.version !== currentVersion)) {
        // Prevent re-posting if version is older or same (basic check implemented above)
        // We need to double check if this version specifically exists to be safe
        const existingVersion = await prisma.systemUpdate.findFirst({
            where: { version: currentVersion }
        });

        if (!existingVersion) {
            console.log(`[AutoUpdate] New version detected: ${currentVersion}. Posting update...`);
            await prisma.systemUpdate.create({
                data: {
                    title: `System Update v${currentVersion}`,
                    version: currentVersion,
                    content: "• General system improvements and performance optimizations.\n• Bug fixes and stability enhancements.",
                    type: "UPDATE"
                }
            });
        }
    }
    // -------------------------

    // -------------------------

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

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-hidden font-sans text-gray-900 selection:bg-brand-cyan/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 blur-[130px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-400/20 blur-[130px]" />
                <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] rounded-full bg-cyan-400/10 blur-[100px]" />
            </div>

            <main className="relative z-10 p-6 max-w-[1600px] mx-auto">
                {/* Header */}
                <header className="mb-12 mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-xs font-bold uppercase tracking-wider text-gray-600 mb-4 shadow-sm">
                            <Shield className="fill-gray-600" size={12} />
                            Platform Admin
                        </div>
                        <h1 className="text-5xl font-black tracking-tight text-gray-900 mb-2">
                            Overview
                        </h1>
                        <p className="text-lg text-gray-500 font-medium">Hello, Super Admin. Here is what is happening today.</p>
                    </div>

                    <div className="flex gap-4">
                        <Link href="/platform-admin/updates" className="inline-flex items-center gap-2 bg-white text-gray-900 border border-gray-200 px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition shadow-sm">
                            <Sparkles size={18} className="text-brand-cyan" /> Post Update
                        </Link>
                        <Link href="/platform-admin/finance" className="inline-flex items-center gap-2 bg-white text-gray-900 border border-gray-200 px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition shadow-sm">
                            <Wallet size={18} className="text-green-600" /> Payouts
                        </Link>
                        <Link href="/" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition shadow-xl shadow-black/10 active:scale-95">
                            <Store size={18} /> Visit Storefront
                        </Link>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-12">
                    {/* Revenue Card - Spans 2 cols on huge screens */}
                    <div className="md:col-span-2 xl:col-span-2 bg-white/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/60 shadow-xl shadow-gray-200/40 relative overflow-hidden group hover:-translate-y-1 transition duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 opacity-10 rounded-bl-[100px] transition group-hover:scale-110 group-hover:opacity-20" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 z-10 relative">Total Platform Revenue</p>
                        <div className="flex items-end gap-2 relative z-10">
                            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-600 to-emerald-800">
                                ₵{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <StatCard label="Total Stores" value={stats.total} gradient="from-blue-500 to-blue-600" />
                    <StatCard label="Active" value={stats.active} gradient="from-green-500 to-emerald-600" />
                    <StatCard label="Suspended" value={stats.suspended} gradient="from-red-500 to-rose-600" />
                    <StatCard label="Hustler" value={stats.hustler} gradient="from-gray-500 to-gray-600" />
                    <StatCard label="Pro" value={stats.pro} gradient="from-purple-500 to-indigo-600" />
                    <StatCard label="Wholesaler" value={stats.wholesaler} gradient="from-orange-500 to-amber-600" />
                </div>

                {/* Stores Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-gray-900">All Stores</h2>
                        <span className="text-sm font-bold text-gray-400">{stores.length} registered</span>
                    </div>

                    <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-gray-200/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/50 border-b border-gray-100/50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Store</th>
                                        <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Owner</th>
                                        <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Stats</th>
                                        <th className="px-8 py-5 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100/50">
                                    {stores.map((store) => (
                                        <tr key={store.id} className="group hover:bg-white/50 transition duration-200">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl font-bold text-gray-500 group-hover:scale-110 transition shadow-inner">
                                                        {store.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-lg leading-tight">{store.name}</p>
                                                        <p className="text-xs font-bold text-gray-400 font-mono mt-1 px-1.5 py-0.5 rounded-md bg-gray-100 inline-block">/{store.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="font-bold text-gray-900">{store.users[0]?.name || "N/A"}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{store.users[0]?.email || "N/A"}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${store.status === "ACTIVE"
                                                                ? "bg-green-50/50 text-green-700 border-green-200"
                                                                : store.status === "SUSPENDED"
                                                                    ? "bg-red-50/50 text-red-700 border-red-200"
                                                                    : "bg-gray-50/50 text-gray-700 border-gray-200"
                                                                }`}
                                                        >
                                                            {store.status === "ACTIVE" ? <CheckCircle size={10} className="fill-current" /> : <Ban size={10} />}
                                                            {store.status}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide opacity-70 ${store.tier === "WHOLESALER"
                                                            ? "bg-orange-100 text-orange-800"
                                                            : store.tier === "PRO"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : "bg-gray-200 text-gray-600"
                                                            }`}
                                                    >
                                                        {store.tier} PLAN
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-4 text-sm font-medium">
                                                    <div className="text-center">
                                                        <span className="block font-black text-gray-900 text-base">{store._count.products}</span>
                                                        <span className="text-[10px] uppercase text-gray-400 font-bold">Items</span>
                                                    </div>
                                                    <div className="w-px h-8 bg-gray-200" />
                                                    <div className="text-center">
                                                        <span className="block font-black text-gray-900 text-base">{store._count.orders}</span>
                                                        <span className="text-[10px] uppercase text-gray-400 font-bold">Orders</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <StoreActions store={{ ...store, tier: store.tier }} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, gradient }: { label: string; value: number; gradient: string }) {
    return (
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-xl shadow-gray-200/40 relative overflow-hidden group hover:-translate-y-1 transition duration-300">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-[100px] transition group-hover:scale-110 group-hover:opacity-20`} />

            <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 z-10 relative">{label}</p>
            <div className="flex items-end gap-2 relative z-10">
                <span className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br ${gradient}`}>
                    {value}
                </span>
            </div>
        </div>
    );
}
