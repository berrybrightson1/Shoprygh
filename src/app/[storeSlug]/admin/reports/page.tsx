import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BarChart, TrendingUp, ShoppingBag, Package, DollarSign, Calendar } from "lucide-react";

export default async function ReportsPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug }
    });

    if (!store) notFound();

    // Fetch Analytics Data
    const [orders, products] = await Promise.all([
        prisma.order.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.product.findMany({
            where: { storeId: store.id }
        })
    ]);

    // Calculate Metrics
    const totalRevenue = orders
        .filter(o => o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + Number(o.total), 0);

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

    // Calculate Average Order Value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / orders.filter(o => o.status !== 'CANCELLED').length : 0;

    return (

        <div className="p-4 sm:p-8 max-w-[1400px] mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-black text-brand-purple tracking-widest uppercase">Analytics</span>
                        <div className="h-px bg-gray-200 flex-1" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                        Insights
                    </h1>
                    <p className="text-lg text-gray-500 font-medium mt-2">Real-time performance metrics for <strong className="text-gray-900">{store.name}</strong></p>
                </div>
                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                    <button className="px-6 py-2 bg-white rounded-md shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-900 border border-gray-100/50">Today</button>
                    <button className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-all">Week</button>
                    <button className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-all">Month</button>
                    <button className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:bg-gray-200/50 rounded-md transition-all">Year</button>
                </div>
            </header>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label="Total Revenue"
                    value={`₵${totalRevenue.toLocaleString()}`}
                    icon={<DollarSign size={20} className="text-green-600" />}
                    color="text-green-600"
                    bg="bg-green-50"
                    trend="+12% vs last month"
                    trendUp={true}
                />
                <StatCard
                    label="Total Orders"
                    value={totalOrders.toString()}
                    icon={<ShoppingBag size={20} className="text-blue-600" />}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <StatCard
                    label="Avg. Order Value"
                    value={`₵${averageOrderValue.toFixed(2)}`}
                    icon={<TrendingUp size={20} className="text-purple-600" />}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
                <StatCard
                    label="Total Products"
                    value={products.length.toString()}
                    icon={<Package size={20} className="text-orange-600" />}
                    color="text-orange-600"
                    bg="bg-orange-50"
                />
            </div>

            {/* Order Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
                    <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                            <Calendar size={20} />
                        </div>
                        Recent Activity
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-gray-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-4">Order ID</th>
                                    <th className="px-4 py-4">Date</th>
                                    <th className="px-4 py-4">Customer</th>
                                    <th className="px-4 py-4">Amount</th>
                                    <th className="px-4 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.slice(0, 5).map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50/80 transition group">
                                        <td className="px-4 py-4 font-mono text-xs font-bold text-gray-500 group-hover:text-brand-purple">#{order.id.slice(-6).toUpperCase()}</td>
                                        <td className="px-4 py-4 text-gray-900 font-bold">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-4 font-medium text-gray-600">{order.customerPhone || 'Guest'}</td>
                                        <td className="px-4 py-4 font-black text-gray-900">₵{Number(order.total).toFixed(2)}</td>
                                        <td className="px-4 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${order.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                                                order.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                                                    'bg-yellow-50 text-yellow-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl mt-4 border border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold">No recent orders found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-gray-900 text-white rounded-[32px] shadow-2xl shadow-gray-900/20 p-8 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-8">Sales Health</h2>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between text-sm mb-3 font-bold opacity-90">
                                    <span>Completion Rate</span>
                                    <span>{totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-cyan rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                                        style={{ width: `${totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-3 font-bold opacity-90">
                                    <span>Pending Orders</span>
                                    <span>{pendingOrders}</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-brand-orange rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                        style={{ width: `${totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 p-4 bg-white/5 rounded-2xl border border-white/10 mt-8 backdrop-blur-sm">
                        <p className="text-xs text-gray-300 leading-relaxed font-medium">
                            <strong className="text-brand-cyan block mb-1 uppercase tracking-wide text-[10px]">Pro Tip</strong>
                            Share your store link on WhatsApp Status to boost visibility and increase conversion rates by up to 40%.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, bg, trend, trendUp }: any) {
    return (
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:scale-[1.02] transition duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${bg} ${color}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trendUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1 group-hover:text-brand-purple transition-colors">{label}</p>
            </div>
        </div>
    );
}
