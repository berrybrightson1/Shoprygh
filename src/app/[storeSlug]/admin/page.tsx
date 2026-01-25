import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    TrendingUp,
    ShoppingBag,
    Users,
    AlertCircle,
    Plus,
    ArrowRight,
    Wallet,
    Tag,
    Clock,
    Package,
    ChevronRight,
    Activity,
    Store
} from "lucide-react";



export default async function AdminDashboard({ params }: { params: Promise<{ storeSlug: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");
    const { storeSlug } = await params;

    const storeId = session.storeId;

    // --- Data Fetching ---

    // --- Data Fetching (Parallelized) ---
    const [
        revenueResult,
        ordersToday,
        totalCustomers,
        totalProducts,
        recentOrders,
        auditLogs
    ] = await Promise.all([
        // 1. Total Revenue
        prisma.order.aggregate({
            where: { storeId, status: "COMPLETED" },
            _sum: { total: true }
        }),
        // 2. Orders Today
        prisma.order.count({
            where: {
                storeId,
                createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }
        }),
        // 3. Total Customers
        prisma.customer.count({
            where: { storeId }
        }),
        // 4. Total Inventory Items
        prisma.product.count({
            where: { storeId }
        }),
        // 5. Recent Orders Feed
        prisma.order.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { items: true }
        }),
        // 6. System Activity Logs
        prisma.auditLog.findMany({
            where: {
                OR: [
                    { entityId: storeId, entityType: "STORE" }, // Actions ON the store
                    { user: { storeId: storeId } }             // Actions BY store staff
                ]
            },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { user: { select: { name: true, image: true, email: true } } }
        })
    ]);

    const totalRevenue = Number(revenueResult._sum.total || 0);

    // --- UI Components ---

    // --- Helpers ---
    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    // Simple SVG Sparkline Generator (Visual Only for now)
    const Sparkline = ({ color }: { color: string }) => {
        const points = "0,20 10,15 20,18 30,12 40,16 50,10 60,14 70,5 80,10 90,2 100,5";
        return (
            <svg viewBox="0 0 100 25" className="w-full h-12 opacity-30" preserveAspectRatio="none">
                <path
                    d={`M${points}`}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    className="animate-pulse" // Subtle pulse
                />
                <path
                    d={`M0,25 L${points} L100,25 Z`}
                    fill={color}
                    fillOpacity="0.1"
                />
            </svg>
        );
    };

    const AliveStatCard = ({ label, value, color, icon: Icon, subtext, trend }: { label: string; value: string | number; color: string; icon: any; subtext?: string, trend?: string }) => {
        const colorStyles: Record<string, { bg: string, text: string, hex: string }> = {
            cyan: { bg: "bg-cyan-50", text: "text-brand-cyan", hex: "#06b6d4" }, // cyan-500
            orange: { bg: "bg-orange-50", text: "text-brand-orange", hex: "#f97316" }, // orange-500
            purple: { bg: "bg-purple-50", text: "text-purple-600", hex: "#9333ea" }, // purple-600
            blue: { bg: "bg-blue-50", text: "text-blue-600", hex: "#2563eb" }, // blue-600
        };

        const style = colorStyles[color];

        return (
            <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-[32px] p-6 border border-white/50 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-brand-cyan/10 transition-all duration-500 group flex flex-col justify-between min-h-[160px]">
                {/* Background Ambient Glow */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40 ${style.bg.replace("bg-", "bg-")}`} style={{ backgroundColor: style.hex }} />

                {/* Header: Label & Icon */}
                <div className="flex justify-between items-start relative z-10">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</span>
                        {subtext && <span className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">{subtext}</span>}
                    </div>

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg} ${style.text} shadow-sm border border-white/50 group-hover:scale-110 transition-transform duration-500`}>
                        <Icon size={18} strokeWidth={2.5} />
                    </div>
                </div>

                {/* Footer: Value & Trend */}
                <div className="relative z-10 mt-auto">
                    <div className="flex items-end justify-between">
                        <span className="text-4xl lg:text-5xl font-medium text-gray-900 tracking-tighter leading-none">{value}</span>

                        {trend && (
                            <div className="flex items-center gap-1 min-w-0 bg-white/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                                <TrendingUp size={14} className="text-emerald-500" strokeWidth={3} />
                                <span className="text-[11px] font-bold text-emerald-600 tracking-tight">{trend}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sparkline at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none opacity-50 mask-image-gradient-b">
                    <Sparkline color={style.hex} />
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-24 lg:pb-8 relative">
            {/* Ambient Background Lights */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-cyan/5 to-transparent pointer-events-none -z-10" />
            <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 pt-4">
                <div className="md:pl-0 relative">
                    {/* Decorative label: Vibe Coded Signature Style */}
                    {/* Decorative label: Premium White Pill */}
                    {/* Decorative label: Premium White Pill */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)] animate-pulse" />
                        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">{getTimeBasedGreeting()}</span>
                    </div>

                    <h1 className="text-4xl lg:text-6xl font-medium text-gray-900 tracking-tighter mb-2">
                        {session.name}
                    </h1>
                    <p className="text-gray-500 font-medium text-base lg:text-lg max-w-lg leading-relaxed">
                        Here's your command center for today. Inventory health is <span className="text-emerald-600 font-bold">Good</span>.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Link href={`/${storeSlug}/admin/inventory`} className="group relative px-8 py-4 bg-gray-900 text-white rounded-[24px] font-bold text-xs uppercase tracking-widest shadow-2xl shadow-gray-900/20 hover:scale-105 active:scale-95 transition-all overflow-hidden flex items-center gap-3">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Plus size={18} strokeWidth={3} className="relative z-10" />
                        <span className="relative z-10">Add Product</span>
                    </Link>
                </div>
            </header>

            {/* Premium Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <AliveStatCard
                    label="Total Revenue"
                    value={`₵${totalRevenue.toLocaleString()}`}
                    color="cyan"
                    icon={Wallet}
                    subtext="Lifetime"
                    trend="+12%"
                />
                <AliveStatCard
                    label="Orders Today"
                    value={ordersToday}
                    color="orange"
                    icon={ShoppingBag}
                    subtext="Daily Volume"
                />
                <AliveStatCard
                    label="Active Members"
                    value={totalCustomers}
                    color="purple"
                    icon={Users}
                    subtext="Total Users"
                />
                <Link href={`/${storeSlug}/admin/inventory`} className="block group h-full">
                    <AliveStatCard
                        label="Inventory Size"
                        value={totalProducts}
                        color="blue"
                        icon={Package}
                        subtext="Stock Items"
                    />
                </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Feed: Timeline Style */}
                <div className="xl:col-span-8 flex flex-col gap-6">
                    <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] border border-white/60 shadow-xl shadow-gray-100/50 p-8 lg:p-10 min-h-[600px] relative overflow-hidden">
                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h2 className="text-2xl font-medium text-gray-900 tracking-tight">Activity Feed</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Live Transaction Stream</p>
                            </div>
                            <Link href={`/${storeSlug}/admin/orders`} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                                <ArrowRight size={18} />
                            </Link>
                        </div>

                        {/* Dotted Line Background */}
                        <div className="absolute left-[39px] top-32 bottom-10 w-px border-l-2 border-dashed border-gray-100 z-0 hidden sm:block" />

                        <div className="space-y-8 relative z-10">
                            {recentOrders.length === 0 ? (
                                <div className="text-center py-20 opacity-50">
                                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-900 font-medium">No recent activity</p>
                                </div>
                            ) : (
                                recentOrders.map((order, i) => (
                                    <Link key={order.id} href={`/${storeSlug}/admin/orders/${order.id}`} className="group relative flex items-start gap-6 sm:gap-8 hover:bg-gray-50/50 p-4 -mx-4 rounded-[28px] transition-colors">
                                        {/* Timeline Node */}
                                        <div className="hidden sm:flex relative z-10 shrink-0 w-12 h-12 rounded-[18px] bg-white border border-gray-100 shadow-sm items-center justify-center text-gray-900 text-lg font-bold group-hover:scale-110 group-hover:border-brand-cyan/30 group-hover:text-brand-cyan transition-all duration-300">
                                            {order.customerName?.charAt(0) || "?"}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <h3 className="font-medium text-lg text-gray-900 tracking-tight group-hover:text-brand-cyan transition-colors truncate">
                                                    New Order from <span className="font-bold">{order.customerName || "Guest"}</span>
                                                </h3>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0 whitespace-nowrap bg-gray-100/50 px-2 py-1 rounded-lg">
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    order.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        'bg-gray-100 text-gray-500 border-gray-200'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-xs text-gray-400 font-medium">•</span>
                                                <span className="text-xs text-gray-500 font-medium">{order.items.length} items</span>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <div className="font-medium text-xl text-gray-900 tracking-tight">₵{Number(order.total).toFixed(2)}</div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Side Panel: Quick Actions */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-[40px] p-8 lg:p-10 shadow-2xl shadow-gray-900/20 relative overflow-hidden min-h-[400px] flex flex-col">
                        {/* Decorative blobs */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/20 blur-[80px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple/20 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative z-10 mb-8">
                            <h2 className="text-2xl font-medium tracking-tight text-white">Quick Actions</h2>
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Shortcuts</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 relative z-10">
                            <Link href={`/${storeSlug}`} target="_blank" className="flex items-center gap-4 p-4 rounded-[24px] bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-md transition-all group active:scale-95">
                                <div className="w-10 h-10 rounded-xl bg-emerald-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <Store size={20} className="stroke-[2.5]" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-white">Visit Storefront</div>
                                    <div className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Live Preview</div>
                                </div>
                                <ArrowRight size={16} className="ml-auto text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </Link>
                            <Link href={`/${storeSlug}/admin/settings`} className="flex items-center gap-4 p-4 rounded-[24px] bg-white/10 hover:bg-white/20 border border-white/5 backdrop-blur-md transition-all group active:scale-95">
                                <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Wallet size={20} className="stroke-[2.5]" />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-white">Billing</div>
                                    <div className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Settings</div>
                                </div>
                            </Link>
                        </div>

                        <div className="mt-auto pt-8 relative z-10">
                            <div className="p-5 rounded-[24px] bg-white/5 border border-white/5 backdrop-blur-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    {recentOrders.length > 0 ? (
                                        <>
                                            <TrendingUp size={16} className="text-brand-cyan" />
                                            <span className="text-xs font-bold text-white uppercase tracking-widest">Trend</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={16} className="text-brand-orange" />
                                            <span className="text-xs font-bold text-white uppercase tracking-widest">Tip</span>
                                        </>
                                    )}
                                </div>
                                <p className="text-sm text-white/70 leading-relaxed font-medium">
                                    {recentOrders.length > 0
                                        ? "Most orders happen between 6PM and 9PM. Consider scheduling checks then."
                                        : "Your store is ready. Share your link to get your first order!"
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper (Moved inside page used to be standalone but keeping file clean)
// Removed old ActionLink component as it is replaced by unique Quick Action cards
