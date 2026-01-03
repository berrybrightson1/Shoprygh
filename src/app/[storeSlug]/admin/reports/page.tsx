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
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-xs font-bold uppercase tracking-wider text-gray-600 mb-4 shadow-sm">
                    <BarChart className="text-gray-600" size={12} />
                    Analytics
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                    Insights
                </h1>
                <p className="text-lg text-gray-500">Real-time performance metrics for {store.name}</p>
            </header>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Total Revenue"
                    value={`₵${totalRevenue.toLocaleString()}`}
                    icon={<DollarSign size={24} className="text-green-600" />}
                    gradient="from-green-500 to-emerald-600"
                    trend="+12% vs last month"
                    trendUp={true}
                />
                <StatCard
                    label="Total Orders"
                    value={totalOrders.toString()}
                    icon={<ShoppingBag size={24} className="text-blue-600" />}
                    gradient="from-blue-500 to-cyan-600"
                />
                <StatCard
                    label="Avg. Order Value"
                    value={`₵${averageOrderValue.toFixed(2)}`}
                    icon={<TrendingUp size={24} className="text-purple-600" />}
                    gradient="from-purple-500 to-indigo-600"
                />
                <StatCard
                    label="Total Products"
                    value={products.length.toString()}
                    icon={<Package size={24} className="text-orange-600" />}
                    gradient="from-orange-500 to-amber-600"
                />
            </div>

            {/* Order Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-gray-200/50 p-6">
                    <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Calendar size={20} className="text-gray-400" /> Recent Activity
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/50 text-gray-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Order ID</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100/50">
                                {orders.slice(0, 5).map(order => (
                                    <tr key={order.id} className="hover:bg-white/50 transition">
                                        <td className="px-4 py-3 font-mono text-gray-600">#{order.id.slice(-6).toUpperCase()}</td>
                                        <td className="px-4 py-3 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-medium">{order.customerPhone || 'Guest'}</td>
                                        <td className="px-4 py-3 font-black text-gray-900">₵{Number(order.total).toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {orders.length === 0 && (
                            <div className="text-center py-12 text-gray-400">No recent orders</div>
                        )}
                    </div>
                </div>

                {/* Performance Summary */}
                <div className="bg-gray-900 text-white rounded-3xl shadow-xl shadow-gray-900/20 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

                    <h2 className="text-xl font-black mb-6 relative z-10">Sales Health</h2>

                    <div className="space-y-8 relative z-10">
                        <div>
                            <div className="flex justify-between text-sm mb-2 opacity-80 font-bold">
                                <span>Completion Rate</span>
                                <span>{totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%</span>
                            </div>
                            <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2 opacity-80 font-bold">
                                <span>Pending Orders</span>
                                <span>{pendingOrders}</span>
                            </div>
                            <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                <div
                                    className="h-full bg-yellow-400 rounded-full transition-all duration-1000"
                                    style={{ width: `${totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-800">
                            <p className="text-xs text-gray-400 leading-relaxed">
                                <strong className="text-brand-cyan">Pro Tip:</strong> Share your store link on WhatsApp Status to boost visibility and increase conversion rates by up to 40%.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, gradient, trend, trendUp }: any) {
    return (
        <div className="bg-white/40 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-xl shadow-gray-200/40 hover:-translate-y-1 transition duration-300 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-[100px] transition group-hover:scale-110 group-hover:opacity-20 pointer-events-none`} />

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="p-3 rounded-2xl bg-white shadow-sm border border-gray-100">
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <h3 className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br ${gradient}`}>{value}</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mt-1">{label}</p>
            </div>
        </div>
    );
}
