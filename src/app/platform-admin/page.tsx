import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Shield, AlertCircle, CheckCircle, Ban, Store, Sparkles, Wallet } from "lucide-react";
import StoreActions from "./StoreActions";
import StoreList from "./StoreList";
import PlatformGrowthChart from "./PlatformGrowthChart";
import GlobalActivityFeed from "./GlobalActivityFeed";

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
                    <div className="md:col-span-2 xl:col-span-2 bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100/50 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition duration-300">
                        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-emerald-100 blur-3xl opacity-60 group-hover:scale-110 transition" />
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full bg-emerald-100/50 opacity-100" />

                        <p className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest mb-4 z-10 relative">Total Platform Revenue</p>
                        <div className="relative z-10">
                            <span className="text-5xl font-black text-emerald-900 tracking-tight">
                                ₵{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <StatCard label="Total Stores" value={stats.total} color="blue" />
                    <StatCard label="Active" value={stats.active} color="green" />
                    <StatCard label="Suspended" value={stats.suspended} color="red" />
                    <StatCard label="Hustler" value={stats.hustler} color="gray" />
                    <StatCard label="Pro" value={stats.pro} color="purple" />
                    <StatCard label="Wholesaler" value={stats.wholesaler} color="orange" />
                </div>

                {/* Stores Section (Bento List) */}
                <StoreList stores={stores as any} />

            </main>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    const styles: Record<string, { bg: string; text: string; decoration: string }> = {
        blue: { bg: "bg-blue-50", text: "text-blue-600", decoration: "bg-blue-100" },
        green: { bg: "bg-green-50", text: "text-green-600", decoration: "bg-green-100" },
        red: { bg: "bg-red-50", text: "text-red-600", decoration: "bg-red-100" },
        gray: { bg: "bg-gray-100", text: "text-gray-600", decoration: "bg-gray-200" },
        purple: { bg: "bg-purple-50", text: "text-purple-600", decoration: "bg-purple-100" },
        orange: { bg: "bg-orange-50", text: "text-orange-600", decoration: "bg-orange-100" },
    };

    const style = styles[color] || styles.blue;

    return (
        <div className={`${style.bg} rounded-[2rem] p-6 relative overflow-hidden group hover:-translate-y-1 transition duration-300 border border-white/50 shadow-sm`}>
            {/* Decorative Bloom */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${style.decoration} blur-2xl opacity-60 group-hover:scale-110 transition`} />
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full ${style.decoration} opacity-40`} />

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 z-10 relative">{label}</p>
            <div className="relative z-10">
                <span className={`text-4xl font-black ${style.text} tracking-tight`}>
                    {value}
                </span>
            </div>
        </div>
    );
}
