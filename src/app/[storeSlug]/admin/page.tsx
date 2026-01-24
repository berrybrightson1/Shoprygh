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
    Activity
} from "lucide-react";

import MobileActivityDrawer from "@/components/admin/MobileActivityDrawer";
import MobileSystemLogsDrawer from "@/components/admin/MobileSystemLogsDrawer";

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

    const StatCard = ({ label, value, color, icon: Icon, subtext, trend }: { label: string; value: string | number; color: string; icon: any; subtext?: string, trend?: string }) => {
        const colorClasses: Record<string, string> = {
            cyan: "text-brand-cyan bg-cyan-50",
            orange: "text-brand-orange bg-orange-50",
            purple: "text-purple-600 bg-purple-50",
            green: "text-emerald-600 bg-emerald-50",
            red: "text-red-600 bg-red-50",
            gray: "text-gray-400 bg-gray-50",
            blue: "text-blue-600 bg-blue-50",
        };

        return (
            <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-2xl shadow-gray-200/50 hover:shadow-gray-300/60 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[180px]">
                {/* Visual Accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none rounded-full ${colorClasses[color].split(' ')[1]}`} />

                <div className="flex items-start justify-between relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm border border-white ${colorClasses[color]}`}>
                        <Icon size={22} strokeWidth={2.5} />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <TrendingUp size={10} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{trend}</span>
                        </div>
                    )}
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.2em]">{label}</p>
                        {subtext && <span className="text-[9px] font-medium text-gray-300 uppercase">/ {subtext}</span>}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-medium text-gray-900 tracking-tight leading-none">
                            {value}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 pb-24 lg:pb-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="md:pl-0">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.3em]">Live Overview</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-medium text-gray-900 tracking-tight">
                        Store Cockpit
                    </h1>
                    <p className="text-gray-500 font-medium mt-3 ml-0.5 text-sm lg:text-base opacity-80">Operational hub for your commerce engine.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/${storeSlug}/admin/inventory`} className="px-6 py-3.5 bg-black text-white rounded-3xl font-medium text-xs uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <Plus size={16} strokeWidth={3} />
                        Add Product
                    </Link>
                </div>
            </header>

            {/* Premium Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    label="Revenue"
                    value={`₵${totalRevenue.toLocaleString()}`}
                    color="cyan"
                    icon={Wallet}
                    subtext="Lifetime"
                    trend="+12%"
                />
                <StatCard
                    label="Orders"
                    value={ordersToday}
                    color="orange"
                    icon={ShoppingBag}
                    subtext="Today"
                />
                <StatCard
                    label="Active Base"
                    value={totalCustomers}
                    color="purple"
                    icon={Users}
                    subtext="Total Users"
                />
                <Link href={`/${storeSlug}/admin/inventory`} className="block group">
                    <StatCard
                        label="Inventory Items"
                        value={totalProducts}
                        color="blue"
                        icon={Package}
                        subtext="Total Products"
                    />
                </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content Area: Integrated Hub */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col min-h-[600px]">
                        {/* Hub Header */}
                        <div className="p-8 lg:p-10 border-b border-gray-50 flex items-center justify-between bg-white relative z-10">
                            <div>
                                <h2 className="text-2xl font-medium text-gray-900 tracking-tight flex items-center gap-3">
                                    Recent Orders
                                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-100 animate-pulse" />
                                </h2>
                                <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">Real-time fulfillment stream</p>
                            </div>
                            <Link href={`/${storeSlug}/admin/orders`} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all active:scale-95 group">
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Hub Scrollable Feed */}
                        <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50/10">
                            {recentOrders.length === 0 ? (
                                <div className="p-20 text-center flex flex-col items-center justify-center h-full">
                                    <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl shadow-gray-100 border border-gray-50 flex items-center justify-center mb-6 ring-4 ring-gray-50/50">
                                        <ShoppingBag size={40} className="text-gray-200" />
                                    </div>
                                    <p className="font-black text-2xl text-gray-900 tracking-tight">No Sales Yet</p>
                                    <p className="text-sm text-gray-400 font-bold mt-2 uppercase tracking-wide">Ready for your first conversion?</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100/50">
                                    {recentOrders.map(order => (
                                        <Link key={order.id} href={`/${storeSlug}/admin/orders/${order.id}`} className="p-8 lg:px-10 hover:bg-white hover:shadow-[0_0_80px_rgba(0,0,0,0.02)] transition-all flex items-center justify-between group cursor-pointer relative overflow-hidden">
                                            <div className="absolute left-0 top-0 w-1 h-full bg-brand-cyan transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />

                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[24px] bg-white border border-gray-100 shadow-lg shadow-gray-200/50 flex items-center justify-center font-medium text-2xl text-gray-900 group-hover:rotate-6 transition-transform">
                                                    {order.customerName?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-xl tracking-tight group-hover:text-brand-cyan transition-colors">{order.customerName || "Guest Customer"}</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-[10px] font-medium uppercase text-gray-400 tracking-widest bg-gray-100 px-2 py-1 rounded-md">{order.items.length} Units</span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                                        <span className="text-[10px] font-medium uppercase text-gray-400 tracking-widest">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-medium text-2xl text-gray-900 tracking-tight">₵{Number(order.total).toFixed(2)}</p>
                                                <div className="mt-2 text-right">
                                                    <span className={`text-[10px] font-medium uppercase tracking-[0.2em] px-3 py-1.5 rounded-2xl border ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        order.status === 'PENDING' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                            'bg-gray-50 text-gray-600 border-gray-100 opacity-60'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Hub Footer */}
                        {recentOrders.length > 0 && (
                            <div className="p-6 bg-white border-t border-gray-50 text-center">
                                <Link href={`/${storeSlug}/admin/orders`} className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-black uppercase tracking-[0.2em] transition-all">
                                    Full Transaction History
                                    <ChevronRight size={14} strokeWidth={3} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions Panel: Integrated Hub */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 p-8 lg:p-10 flex flex-col gap-8 h-full">
                        <div>
                            <h2 className="text-2xl font-medium text-gray-900 tracking-tight">Rapid Entry</h2>
                            <p className="text-[11px] text-gray-400 font-medium mt-1 uppercase tracking-widest">Optimized workflows</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <ActionLink
                                href={`/${storeSlug}/admin/inventory`}
                                icon={<Plus size={22} />}
                                label="Inventory"
                                description="Add catalog items"
                                color="cyan"
                            />
                        </div>

                        {/* Decoration Area */}
                        <div className="mt-4 p-8 rounded-[32px] bg-gray-50/50 border border-gray-100/50 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-[24px] bg-white shadow-xl shadow-gray-200 border border-gray-50 mb-4 flex items-center justify-center">
                                <Activity size={24} className="text-gray-300" />
                            </div>
                            <p className="text-[10px] font-medium text-gray-300 uppercase tracking-[0.2em] leading-relaxed max-w-[150px]">
                                Use the cockpit to monitor live store traffic.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionLink({ href, icon, label, description, color }: { href: string, icon: any, label: string, description: string, color: string }) {
    const colorClasses: Record<string, string> = {
        cyan: "bg-cyan-50 text-brand-cyan",
        orange: "bg-orange-50 text-brand-orange",
        purple: "bg-purple-50 text-purple-600",
        gray: "bg-gray-100 text-gray-400",
    };

    return (
        <Link href={href} className="group w-full flex items-center gap-5 p-5 rounded-[32px] bg-gray-50/30 border border-gray-100/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 hover:border-gray-100 transition-all duration-300 active:scale-95">
            <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-sm border border-white ${colorClasses[color]}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0 text-left">
                <span className="font-medium text-gray-900 block group-hover:text-black transition tracking-tight">{label}</span>
                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-widest mt-0.5 block">{description}</span>
            </div>
            <ChevronRight size={18} className="text-gray-200 group-hover:text-black transition group-hover:translate-x-1" />
        </Link>
    );
}
