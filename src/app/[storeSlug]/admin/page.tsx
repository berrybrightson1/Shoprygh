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
    Package
} from "lucide-react";

export default async function AdminDashboard({ params }: { params: Promise<{ storeSlug: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");
    const { storeSlug } = await params;

    const storeId = session.storeId;

    // --- Data Fetching ---

    // 1. Total Revenue (Sum of all completed orders)
    // We could use WalletTransactions for accuracy, but sum of Orders is fine for now.
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
        include: { items: true } // to get item count if needed
    });

    // --- UI Components ---

    const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition">
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-black text-gray-900">{value}</h3>
                {subtext && <p className="text-xs font-medium text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition`}>
                <Icon size={24} />
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <header>
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <LayoutDashboard className="text-brand-purple" size={32} />
                    Cockpit
                </h1>
                <p className="text-gray-500 font-medium">Overview of your store's performance today.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₵${totalRevenue.toLocaleString()}`}
                    icon={TrendingUp}
                    color="bg-green-100 text-green-600"
                    subtext="Lifetime Sales"
                />
                <StatCard
                    title="Orders Today"
                    value={ordersToday}
                    icon={ShoppingBag}
                    color="bg-blue-100 text-blue-600"
                    subtext={new Date().toLocaleDateString()}
                />
                <StatCard
                    title="Customers"
                    value={totalCustomers}
                    icon={Users}
                    color="bg-purple-100 text-purple-600"
                    subtext="Unique Buyers"
                />
                <Link href={`/${storeSlug}/admin/inventory`}>
                    <StatCard
                        title="Low Stock"
                        value={lowStockCount}
                        icon={AlertCircle}
                        color={lowStockCount > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"}
                        subtext="Items require attention"
                    />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <Clock size={20} className="text-gray-400" /> Recent Activity
                        </h2>
                        <Link href={`/${storeSlug}/admin/orders`} className="text-sm font-bold text-brand-purple hover:underline">
                            View All Orders
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {recentOrders.length === 0 ? (
                                <div className="p-12 text-center text-gray-400">
                                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">No orders yet.</p>
                                </div>
                            ) : (
                                recentOrders.map(order => (
                                    <div key={order.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                {order.customerName?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{order.customerName || "Guest"}</p>
                                                <p className="text-xs text-gray-400 font-bold">{order.items.length} items • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900 text-sm">₵{Number(order.total).toFixed(2)}</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Quick Actions */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-gray-900">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <Link href={`/${storeSlug}/admin/inventory/new`} className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-cyan/50 transition flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center group-hover:scale-110 transition">
                                <Plus size={20} />
                            </div>
                            <span className="font-bold text-gray-700 group-hover:text-brand-cyan">Add Product</span>
                        </Link>

                        <Link href={`/${storeSlug}/admin/marketing`} className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-orange/50 transition flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center group-hover:scale-110 transition">
                                <Tag size={20} />
                            </div>
                            <span className="font-bold text-gray-700 group-hover:text-brand-orange">Create Coupon</span>
                        </Link>

                        <Link href={`/${storeSlug}/admin/finance`} className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-500/50 transition flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition">
                                <Wallet size={20} />
                            </div>
                            <span className="font-bold text-gray-700 group-hover:text-green-600">Request Payout</span>
                        </Link>

                        <Link href={`/${storeSlug}/admin/inventory`} className="group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-500/50 transition flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
                                <Package size={20} />
                            </div>
                            <span className="font-bold text-gray-700 group-hover:text-purple-600">Manage Stock</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
