import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BarChart, TrendingUp, ShoppingBag, Package, DollarSign, Calendar } from "lucide-react";

export default async function ReportsPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug }
    });

    if (!store) notFound();

    // Fetch Analytics Data Efficiently
    const [revenueAgg, orderCounts, productCount, recentOrders] = await Promise.all([
        // 1. Total Revenue
        prisma.order.aggregate({
            where: {
                storeId: store.id,
                status: { not: 'CANCELLED' } // Exclude cancelled from revenue
            },
            _sum: { total: true }
        }),
        // 2. Order Counts (Grouped by status for efficiency if needed, or simple counts)
        prisma.order.groupBy({
            by: ['status'],
            where: { storeId: store.id },
            _count: { id: true }
        }),
        // 3. Catalog Depth
        prisma.product.count({
            where: { storeId: store.id }
        }),
        // 4. Recent Activity (Limit 8)
        prisma.order.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: 'desc' },
            take: 8,
            select: {
                id: true,
                createdAt: true,
                customerPhone: true,
                total: true,
                status: true
            }
        })
    ]);

    // Process Metrics
    const totalRevenue = revenueAgg._sum.total ? Number(revenueAgg._sum.total) : 0;

    const totalOrders = orderCounts.reduce((acc, curr) => acc + curr._count.id, 0);
    const completedOrders = orderCounts.find(c => c.status === 'COMPLETED')?._count.id || 0;
    const pendingOrders = orderCounts.find(c => c.status === 'PENDING')?._count.id || 0;

    // Calculate Average Order Value
    const validOrdersCount = orderCounts.filter(c => c.status !== 'CANCELLED').reduce((acc, curr) => acc + curr._count.id, 0);
    const averageOrderValue = validOrdersCount > 0 ? totalRevenue / validOrdersCount : 0;

    // For UI compatibility mapping
    const orders = recentOrders;
    const products = { length: productCount }; // Mock object for length check

    return (

        <div className="p-8 lg:p-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-brand-purple flex items-center justify-center border border-purple-100 shadow-sm">
                            <BarChart size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                            Intelligence Hub
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 font-bold ml-1 uppercase tracking-widest">Store performance & shipment velocity</p>
                </div>

                <div className="flex items-center bg-gray-50 border border-gray-100 p-1.5 rounded-2xl shadow-sm">
                    {['Today', 'Week', 'Month', 'Year'].map((period, i) => (
                        <button
                            key={period}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'}`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </header>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <StatCard
                    label="Aggregate Revenue"
                    value={`₵${totalRevenue.toLocaleString()}`}
                    icon={<DollarSign size={20} strokeWidth={3} />}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                    trend="+12% VS LAST"
                    trendUp={true}
                />
                <StatCard
                    label="Logistics Count"
                    value={totalOrders.toString()}
                    icon={<ShoppingBag size={20} strokeWidth={3} />}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    label="Liquidity Average"
                    value={`₵${averageOrderValue.toFixed(2)}`}
                    icon={<TrendingUp size={20} strokeWidth={3} />}
                    color="text-brand-purple"
                    bg="bg-purple-50"
                />
                <StatCard
                    label="Catalog Depth"
                    value={products.length.toString()}
                    icon={<Package size={20} strokeWidth={3} />}
                    color="text-orange-600"
                    bg="bg-orange-50"
                />
            </div>

            {/* Order Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 bg-white">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                            <span className="w-2 h-8 bg-brand-purple rounded-full" />
                            Recent Shipment Activity
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/30 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                    <th className="p-6 pl-10">Identity</th>
                                    <th className="p-6">Timeline</th>
                                    <th className="p-6">Recipient</th>
                                    <th className="p-6">Yield</th>
                                    <th className="p-6 pr-10 text-right">Current State</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.slice(0, 8).map(order => (
                                    <tr key={order.id} className="group hover:bg-gray-50/50 transition-all cursor-default">
                                        <td className="p-6 pl-10 font-black text-[11px] text-gray-400 group-hover:text-brand-purple transition-colors tracking-widest">
                                            #{order.id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="p-6 text-[13px] text-gray-900 font-bold">
                                            {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                                        </td>
                                        <td className="p-6 text-[13px] font-black text-gray-600">
                                            {order.customerPhone ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    {order.customerPhone}
                                                </div>
                                            ) : 'Guest Wallet'}
                                        </td>
                                        <td className="p-6 font-black text-gray-900 text-[15px] tabular-nums tracking-tight">
                                            ₵{Number(order.total).toFixed(2)}
                                        </td>
                                        <td className="p-6 pr-10 text-right">
                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    'bg-orange-50 text-orange-700 border-orange-100'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && (
                            <div className="text-center py-32 bg-white">
                                <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-gray-200">
                                    <ShoppingBag size={40} />
                                </div>
                                <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No activity found in pipeline</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-[#0A0A0B] text-white rounded-[40px] shadow-2xl shadow-black/20 p-10 relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/20 rounded-full blur-[100px] opacity-40 transition-opacity group-hover:opacity-60 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-purple/20 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>

                    <div className="relative z-10 flex-1">
                        <div className="flex items-center justify-between mb-12">
                            <h2 className="text-2xl font-black tracking-tight">Sales Health</h2>
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <TrendingUp size={20} className="text-brand-cyan" />
                            </div>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Completion Efficiency</p>
                                    <p className="text-2xl font-black text-white tabular-nums">{totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%</p>
                                </div>
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-brand-cyan rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(6,182,212,0.4)] relative"
                                        style={{ width: `${totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 mt-3 uppercase tracking-widest">Targeting 95% threshold</p>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Pipeline</p>
                                    <p className="text-2xl font-black text-white tabular-nums">{pendingOrders} <span className="text-[10px] opacity-20">PENDING</span></p>
                                </div>
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-brand-orange rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(249,115,22,0.4)] relative"
                                        style={{ width: `${totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-gray-500 mt-3 uppercase tracking-widest">Critical action required</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 p-6 bg-white/5 rounded-[28px] border border-white/10 mt-12 backdrop-blur-xl group/tip hover:bg-white/10 transition-all cursor-default">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center flex-none group-hover/tip:animate-bounce">
                                <span className="text-brand-cyan text-xs font-black">AI</span>
                            </div>
                            <p className="text-[11px] text-gray-300 leading-relaxed font-bold">
                                <strong className="text-brand-cyan block mb-1 uppercase tracking-[0.2em] text-[10px]">Strategic Insight</strong>
                                Share your store link on WhatsApp Status to boost visibility and increase conversion rates by up to 40%.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, bg, trend, trendUp }: any) {
    return (
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/30 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${bg} blur-[40px] opacity-40 rounded-full -mr-12 -mt-12`} />

            <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={`p-4 rounded-2xl ${bg} ${color} border border-current opacity-80 group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg border uppercase tracking-widest transition-all ${trendUp ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter tabular-nums leading-none mb-2">{value}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-brand-purple transition-colors duration-500">{label}</p>
            </div>
        </div>
    );
}
