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

    // 1. Total Revenue (Sum of all completed orders)
    const revenueResult = await prisma.order.aggregate({
        where: { storeId, status: "COMPLETED" },
        _sum: { total: true }
    });
    const totalRevenue = Number(revenueResult._sum.total || 0);

    // 2. Orders Today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const ordersToday = await prisma.order.count({
        where: {
            storeId,
            createdAt: { gte: startOfDay }
        }
    });

    // 3. Total Customers
    const totalCustomers = await prisma.customer.count({
        where: { storeId }
    });

    // 4. Low Stock Items (< 5)
    const lowStockCount = await prisma.product.count({
        where: {
            storeId,
            stockQty: { lt: 5 }
        }
    });

    // 5. Recent Orders Feed
    const recentOrders = await prisma.order.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true }
    });

    // 6. System Activity Logs (Store Level)
    const auditLogs = await prisma.auditLog.findMany({
        where: {
            OR: [
                { entityId: storeId, entityType: "STORE" }, // Actions ON the store
                { user: { storeId: storeId } }             // Actions BY store staff
            ]
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true, image: true, email: true } } }
    });

    // --- UI Components ---

    const StatCard = ({ label, value, gradient, icon: Icon, subtext }: { label: string; value: string | number; gradient: string; icon: any; subtext?: string }) => {
        return (
            <div className={`relative overflow-hidden rounded-[24px] p-4 sm:p-6 text-white shadow-xl shadow-gray-200/50 group transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${gradient}`}>
                {/* Background Shapes */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                            <Icon size={20} className="text-white" />
                        </div>
                        {subtext && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-1 rounded-full text-white/90 backdrop-blur-sm">
                                {subtext}
                            </span>
                        )}
                    </div>

                    <div>
                        <p className="text-sm font-bold text-white/80 uppercase tracking-widest mb-1">{label}</p>
                        <span className="text-4xl font-black text-white tracking-tight leading-none block">
                            {value}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                {/* Add left padding on desktop to avoid overlap with sidebar toggle button */}
                <div className="md:pl-16">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        Store Cockpit
                    </h1>
                    <p className="text-gray-500 font-bold mt-2 ml-1">Here's what's happening in your store today.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-200">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Updates
                    </span>
                </div>
            </header>

            {/* Gradient Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <StatCard
                    label="Revenue"
                    value={`₵${totalRevenue.toLocaleString()}`}
                    gradient="bg-gradient-to-br from-green-400 to-emerald-600"
                    icon={Wallet}
                    subtext="Lifetime"
                />
                <StatCard
                    label="Orders"
                    value={ordersToday}
                    gradient="bg-gradient-to-br from-blue-400 to-indigo-600"
                    icon={ShoppingBag}
                    subtext="Today"
                />
                <StatCard
                    label="Customers"
                    value={totalCustomers}
                    gradient="bg-gradient-to-br from-purple-400 to-fuchsia-600"
                    icon={Users}
                    subtext="Total"
                />
                <Link href={`/${storeSlug}/admin/inventory`} className="block h-full">
                    <StatCard
                        label="Low Stock"
                        value={lowStockCount}
                        gradient={lowStockCount > 0 ? "bg-gradient-to-br from-orange-400 to-red-600" : "bg-gradient-to-br from-gray-400 to-gray-600"}
                        icon={AlertCircle}
                        subtext={lowStockCount > 0 ? "Action Needed" : "All Good"}
                    />
                </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content: Activity Feed (Hidden on Mobile, shown via Drawer) */}
                <div className="hidden md:block xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            Recent Orders
                        </h2>
                        <Link href={`/${storeSlug}/admin/orders`} className="text-xs font-black text-brand-cyan hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
                        {recentOrders.length === 0 ? (
                            <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                    <ShoppingBag size={24} className="opacity-50" />
                                </div>
                                <p className="font-bold text-gray-900">No orders yet</p>
                                <p className="text-sm mt-1">Your recent sales will appear here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {recentOrders.map(order => (
                                    <Link key={order.id} href={`/${storeSlug}/admin/orders/${order.id}`} className="p-5 hover:bg-gray-50/80 transition flex items-center justify-between group cursor-pointer block">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center font-black text-lg shadow-sm border border-white">
                                                {order.customerName?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 text-base group-hover:text-brand-cyan transition-colors">{order.customerName || "Guest Customer"}</p>
                                                <p className="text-xs text-gray-400 font-bold mt-0.5 flex items-center gap-2">
                                                    <span>{order.items.length} items</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                    <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900 text-base">₵{Number(order.total).toFixed(2)}</p>
                                            <div className="mt-1 flex justify-end">
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    order.status === 'PENDING' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                        'bg-gray-50 text-gray-600 border-gray-100'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                        {recentOrders.length > 0 && (
                            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                                <Link href={`/${storeSlug}/admin/orders`} className="text-xs font-bold text-gray-500 hover:text-brand-cyan transition block py-2">
                                    Show more history
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Sidebar: Quick Actions */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-gray-900">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-3">
                    <Link href={`/${storeSlug}/admin/inventory`} className="group bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-cyan-100 hover:border-brand-cyan/30 transition flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center group-hover:scale-110 transition duration-300">
                                <Plus size={22} />
                            </div>
                            <div>
                                <span className="font-black text-gray-900 block group-hover:text-brand-cyan transition">Add Product</span>
                                <span className="text-xs text-gray-400 font-medium">Update inventory</span>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-brand-cyan group-hover:translate-x-1 transition" />
                    </Link>

                    <Link href={`/${storeSlug}/admin/marketing`} className="group bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-orange-100 hover:border-brand-orange/30 transition flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center group-hover:scale-110 transition duration-300">
                                <Tag size={22} />
                            </div>
                            <div>
                                <span className="font-black text-gray-900 block group-hover:text-brand-orange transition">Create Coupon</span>
                                <span className="text-xs text-gray-400 font-medium">Boost sales</span>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-brand-orange group-hover:translate-x-1 transition" />
                    </Link>

                    <Link href={`/${storeSlug}/admin/finance`} className="group bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-green-100 hover:border-green-500/30 transition flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
                                <Wallet size={22} />
                            </div>
                            <div>
                                <span className="font-black text-gray-900 block group-hover:text-green-600 transition">Request Payout</span>
                                <span className="text-xs text-gray-400 font-medium">Withdraw funds</span>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition" />
                    </Link>

                    <Link href={`/${storeSlug}/admin/inventory`} className="group bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-purple-100 hover:border-purple-500/30 transition flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition duration-300">
                                <Package size={22} />
                            </div>
                            <div>
                                <span className="font-black text-gray-900 block group-hover:text-purple-600 transition">Manage Stock</span>
                                <span className="text-xs text-gray-400 font-medium">View all items</span>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
