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

    const StatCard = ({ label, value, color, subtext }: { label: string; value: string | number; color: string; subtext?: string }) => {
        const styles: Record<string, { bg: string; text: string; decoration: string }> = {
            blue: { bg: "bg-blue-50", text: "text-blue-800", decoration: "bg-blue-200" },
            green: { bg: "bg-green-50", text: "text-green-800", decoration: "bg-green-200" },
            red: { bg: "bg-red-50", text: "text-red-800", decoration: "bg-red-200" },
            purple: { bg: "bg-purple-50", text: "text-purple-800", decoration: "bg-purple-200" },
            orange: { bg: "bg-orange-50", text: "text-orange-800", decoration: "bg-orange-200" },
            gray: { bg: "bg-gray-50", text: "text-gray-800", decoration: "bg-gray-200" },
        };

        const style = styles[color] || styles.blue;

        return (
            <div className={`${style.bg} rounded-[2rem] p-6 relative overflow-hidden group hover:-translate-y-1 transition duration-300 border border-white/60 shadow-sm`}>
                {/* Decorative Bloom */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${style.decoration} blur-3xl opacity-60 group-hover:scale-110 transition`} />
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full ${style.decoration} opacity-20`} />

                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 z-10 relative">{label}</p>
                <div className="relative z-10">
                    <span className={`text-4xl font-black ${style.text} tracking-tight block`}>
                        {value}
                    </span>
                    {subtext && <p className="text-xs font-bold text-gray-500 mt-2 opacity-80">{subtext}</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <header>
                <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                    <LayoutDashboard className="text-brand-purple" size={32} />
                    Cockpit
                </h1>
                <p className="text-gray-600 font-bold mt-1">Overview of your store's performance today.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Revenue"
                    value={`₵${totalRevenue.toLocaleString()}`}
                    color="green"
                    subtext="Lifetime Sales"
                />
                <StatCard
                    label="Orders Today"
                    value={ordersToday}
                    color="blue"
                    subtext={new Date().toLocaleDateString()}
                />
                <StatCard
                    label="Customers"
                    value={totalCustomers}
                    color="purple"
                    subtext="Unique Buyers"
                />
                <Link href={`/${storeSlug}/admin/inventory`}>
                    <StatCard
                        label="Low Stock"
                        value={lowStockCount}
                        color={lowStockCount > 0 ? "red" : "gray"}
                        subtext="Items require attention"
                    />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Activity Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <Clock size={20} className="text-gray-500" /> Recent Activity
                        </h2>
                        <Link href={`/${storeSlug}/admin/orders`} className="text-sm font-black text-brand-purple hover:underline">
                            View All Orders
                        </Link>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {recentOrders.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
                                    <p className="font-bold">No orders yet.</p>
                                </div>
                            ) : (
                                recentOrders.map(order => (
                                    <div key={order.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100">
                                                {order.customerName?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 text-sm">{order.customerName || "Guest"}</p>
                                                <p className="text-xs text-gray-500 font-bold">{order.items.length} items • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
