import prisma from "@/lib/prisma";
import { deleteOrder, updateOrderStatus } from "@/app/[storeSlug]/(store)/actions"; // We'll assume these are available or use inline actions if preferred, but separate is cleaner.
import { Trash2, CheckCircle2, XCircle, Clock, ShoppingBag } from "lucide-react";
import { revalidatePath } from "next/cache";
import ReportCustomerButton from "@/components/admin/ReportCustomerButton";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";

export const dynamic = 'force-dynamic';

export default async function OrdersPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug },
        select: { id: true, slug: true } // Select only needed fields
    });

    if (!store) return <div>Store not found</div>;

    // Parallelize Data Fetching
    const [orders, revenueAgg] = await Promise.all([
        // 1. Fetch recent orders (Limit 50)
        prisma.order.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: 'desc' },
            take: 50, // CRITICAL: Prevent crash on large datasets
            include: {
                items: true,
                customer: {
                    select: { name: true, isVerified: true, status: true } // Select only needed customer fields
                }
            }
        }),
        // 2. Efficient DB-side Aggregation for Total Revenue
        prisma.order.aggregate({
            where: { storeId: store.id },
            _sum: { total: true }
        })
    ]);

    const totalRevenue = revenueAgg._sum.total ? Number(revenueAgg._sum.total) : 0;

    const updateStatusWithStore = updateOrderStatus.bind(null, store.id);
    const deleteOrderWithStore = deleteOrder.bind(null, store.id);

    return (
        <div className="p-8 lg:p-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-brand-orange flex items-center justify-center border border-orange-100 shadow-sm">
                            <ShoppingBag size={24} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-3xl font-medium text-gray-900 tracking-tight">
                            Order Stream
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 font-medium ml-1 uppercase tracking-widest">Real-time fulfillment & logistics</p>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-2xl shadow-emerald-100/50 flex items-center gap-6 group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 blur-[40px] opacity-40 rounded-full" />
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 relative z-10">
                        <span className="text-xl font-medium">₵</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-0.5">Total Revenue Stream</p>
                        <p className="text-2xl font-medium text-gray-900 tracking-tighter tabular-nums leading-none">
                            ₵{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </header>

            {/* Desktop Table View */}
            <div className="hidden xl:block bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
                    <h3 className="font-medium text-gray-900 text-xl tracking-tight flex items-center gap-3">
                        Active Shipments
                        <span className="text-[10px] font-medium text-gray-300 bg-gray-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{orders.length} Records</span>
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Live Updates</span>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="p-32 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={40} className="text-gray-200" />
                        </div>
                        <p className="font-black text-gray-900 text-xl">Station is empty</p>
                        <p className="text-gray-400 font-bold mt-2">Incoming orders will appear here automatically.</p>
                    </div>
                ) : (
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/30 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <th className="p-6 pl-10">Timestamp</th>
                                <th className="p-6">Client Identity</th>
                                <th className="p-6">Manifest</th>
                                <th className="p-6">Transaction</th>
                                <th className="p-6">Logistics</th>
                                <th className="p-6 pr-10 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map((order) => (
                                <tr key={order.id} className="group hover:bg-white hover:shadow-[0_0_80px_rgba(0,0,0,0.02)] transition-all cursor-default">
                                    <td className="p-6 pl-10">
                                        <div className="font-mono text-[11px] font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg inline-block mb-1.5 uppercase tracking-tighter">
                                            #{order.id.slice(-6).toUpperCase()}
                                        </div>
                                        <div className="text-[13px] font-medium text-gray-900 flex items-center gap-2 mb-0.5">
                                            {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>

                                    <td className="p-6">
                                        <div className="flex flex-col gap-1.5">
                                            {order.customerPhone ? (
                                                <a
                                                    href={`tel:${order.customerPhone}`}
                                                    className="text-[15px] font-medium text-gray-900 hover:text-brand-cyan transition-colors"
                                                >
                                                    {order.customerPhone}
                                                </a>
                                            ) : (
                                                <span className="text-gray-300 font-medium">ANONYMOUS</span>
                                            )}

                                            {order.customer && (
                                                <div className="flex items-center gap-2">
                                                    {order.customer.isVerified && (
                                                        <span className="text-[9px] bg-cyan-50 text-brand-cyan px-2 py-0.5 rounded-full font-medium uppercase border border-cyan-100">Verified</span>
                                                    )}
                                                    {order.customer.status === "BANNED" && (
                                                        <span className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium uppercase border border-red-100 animate-pulse">Banned</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="p-6 text-sm">
                                        <div className="flex flex-col gap-1.5">
                                            {order.items.map(item => (
                                                <div key={item.id} className="flex items-center gap-2.5 group/item">
                                                    <span className="w-7 h-7 rounded-lg bg-gray-50 text-gray-900 flex items-center justify-center text-[11px] font-medium border border-gray-100 group-hover/item:bg-black group-hover/item:text-white transition-all">
                                                        {item.quantity}
                                                    </span>
                                                    <span className="text-[13px] font-medium text-gray-600 line-clamp-1">{item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="p-6">
                                        <div className="text-lg font-medium text-gray-900 tracking-tight leading-none mb-1">
                                            ₵{Number(order.total).toFixed(2)}
                                        </div>
                                        <div className="text-[10px] font-medium text-emerald-500 uppercase tracking-widest">Success</div>
                                    </td>

                                    <td className="p-6">
                                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border transition-all duration-500 ${order.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                            order.status === 'CANCELLED' ? 'bg-red-50 border-red-100 text-red-700' :
                                                'bg-orange-50 border-orange-100 text-orange-700'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-500' :
                                                order.status === 'CANCELLED' ? 'bg-red-500' :
                                                    'bg-orange-500 animate-pulse'
                                                }`} />
                                            <span className="text-[11px] font-medium uppercase tracking-[0.1em]">{order.status}</span>
                                        </div>
                                    </td>

                                    <td className="p-6 pr-10">
                                        <div className="flex items-center justify-end gap-3">
                                            {order.customerId && (
                                                <div className="flex items-center gap-2 pr-3 border-r border-gray-100">
                                                    <ReportCustomerButton
                                                        customerId={order.customerId}
                                                        storeId={store.id}
                                                        customerName={order.customer?.name || order.customerPhone || "Customer"}
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2">
                                                {order.status !== 'COMPLETED' && (
                                                    <form action={async () => {
                                                        "use server";
                                                        await updateStatusWithStore(order.id, 'COMPLETED');
                                                    }}>
                                                        <button
                                                            title="Mark Fulfillment Complete"
                                                            className="p-3 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 hover:border-emerald-300 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95"
                                                        >
                                                            <CheckCircle2 size={18} strokeWidth={2.5} />
                                                        </button>
                                                    </form>
                                                )}

                                                {order.status !== 'CANCELLED' && (
                                                    <form action={async () => {
                                                        "use server";
                                                        await updateStatusWithStore(order.id, 'CANCELLED');
                                                    }}>
                                                        <button
                                                            title="Terminate Pipeline"
                                                            className="p-3 bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 hover:border-orange-300 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95"
                                                        >
                                                            <XCircle size={18} strokeWidth={2.5} />
                                                        </button>
                                                    </form>
                                                )}

                                                <DeleteOrderButton
                                                    orderId={order.id}
                                                    deleteAction={deleteOrderWithStore}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Mobile View: High-Fidelity Cards */}
            <div className="xl:hidden space-y-6">
                {orders.length === 0 ? (
                    <div className="p-16 text-center bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50">
                        <ShoppingBag size={48} className="mx-auto mb-4 text-gray-100" />
                        <p className="font-black text-gray-900">No active shipments</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-2xl shadow-gray-200/50 relative group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="font-mono text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase">
                                    #{order.id.slice(-6).toUpperCase()}
                                </div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-medium uppercase tracking-widest ${order.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                    order.status === 'CANCELLED' ? 'bg-red-50 border-red-100 text-red-700' :
                                        'bg-orange-50 border-orange-100 text-orange-700'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-500' :
                                        order.status === 'CANCELLED' ? 'bg-red-500' :
                                            'bg-orange-500 animate-pulse'
                                        }`} />
                                    {order.status}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-xl bg-gray-50 text-gray-900 flex items-center justify-center text-[11px] font-medium border border-gray-100">
                                                {item.quantity}
                                            </span>
                                            <span className="text-[15px] font-medium text-gray-700">{item.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-end border-t border-gray-50 pt-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Client</p>
                                    <p className="font-black text-gray-900">{order.customerPhone || "Guest"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Total Value</p>
                                    <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">₵{Number(order.total).toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Mobile Quick Actions */}
                            <div className="mt-8 pt-6 border-t border-gray-50 flex gap-3">
                                {order.status === 'PENDING' && (
                                    <form action={async () => {
                                        "use server";
                                        await updateStatusWithStore(order.id, 'COMPLETED');
                                    }} className="flex-1">
                                        <button className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-3xl font-black text-xs uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95 shadow-sm">
                                            Complete
                                        </button>
                                    </form>
                                )}
                                <div className="flex-none">
                                    <DeleteOrderButton
                                        orderId={order.id}
                                        deleteAction={deleteOrderWithStore}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
