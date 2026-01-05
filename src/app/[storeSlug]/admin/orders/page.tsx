import prisma from "@/lib/prisma";
import { deleteOrder, updateOrderStatus } from "@/app/[storeSlug]/(store)/actions"; // We'll assume these are available or use inline actions if preferred, but separate is cleaner.
import { Trash2, CheckCircle2, XCircle, Clock, ShoppingBag } from "lucide-react";
import { revalidatePath } from "next/cache";
import ReportCustomerButton from "@/components/admin/ReportCustomerButton";

export const dynamic = 'force-dynamic';

export default async function OrdersPage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params;
    const store = await prisma.store.findUnique({
        where: { slug: storeSlug }
    });

    if (!store) return <div>Store not found</div>;

    const orders = await prisma.order.findMany({
        where: { storeId: store.id }, // Filter by Store
        orderBy: { createdAt: 'desc' },
        include: {
            items: true,
            customer: true // Include customer for reporting
        }
    });

    const updateStatusWithStore = updateOrderStatus.bind(null, store.id);
    const deleteOrderWithStore = deleteOrder.bind(null, store.id);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <ShoppingBag className="text-brand-orange" />
                        Orders Management
                    </h1>
                    <p className="text-gray-600 font-bold mt-1">Manage incoming WhatsApp orders and track fulfillment.</p>
                </div>
                <div className="bg-green-50 px-4 py-3 rounded-xl border border-green-200 shadow-sm text-sm font-bold text-green-800 whitespace-nowrap flex items-center gap-2">
                    Total Revenue: <span className="font-black text-green-700 text-lg">₵{orders.reduce((acc, o) => acc + Number(o.total), 0).toFixed(2)}</span>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
                {orders.length === 0 ? (
                    <div className="p-20 text-center text-gray-500 font-bold">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No orders placed yet.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm min-w-[900px]">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-700 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-black">Order ID</th>
                                <th className="px-6 py-4 font-black">Date</th>
                                <th className="px-6 py-4 font-black">Customer</th>
                                <th className="px-6 py-4 font-black">Items</th>
                                <th className="px-6 py-4 font-black">Total</th>
                                <th className="px-6 py-4 font-black">Status</th>
                                <th className="px-6 py-4 font-black text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-gray-600">#{order.id.slice(-6).toUpperCase()}</td>
                                    <td className="px-6 py-4 text-gray-700 font-bold">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                        <div className="text-xs text-gray-500 font-medium">{new Date(order.createdAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            {order.customerPhone ? (
                                                <a
                                                    href={`tel:${order.customerPhone}`}
                                                    className="font-black text-gray-900 hover:text-brand-cyan hover:underline"
                                                >
                                                    {order.customerPhone}
                                                </a>
                                            ) : (
                                                <span className="text-gray-500 text-xs italic font-bold">N/A</span>
                                            )}
                                        </div>
                                        {/* Trust & Safety Status Indicator */}
                                        {order.customer && (
                                            <div className="mt-1 flex items-center gap-1">
                                                {order.customer.status === "BANNED" && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black">BANNED</span>}
                                                {order.customer.status === "RESTRICTED" && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-black">RESTRICTED</span>}
                                                {order.customer.isVerified && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">VERIFIED</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {order.items.map(item => (
                                                <div key={item.id} className="flex gap-2 text-gray-700">
                                                    <span className="font-bold text-gray-900">{item.quantity}x</span>
                                                    <span>{item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        ₵{Number(order.total).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                                            order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {order.status === 'COMPLETED' ? <CheckCircle2 size={12} /> :
                                                order.status === 'CANCELLED' ? <XCircle size={12} /> :
                                                    <Clock size={12} />}
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Report Button (Trust & Safety) */}
                                            {order.customerId && (
                                                <>
                                                    <ReportCustomerButton
                                                        customerId={order.customerId}
                                                        storeId={store.id}
                                                        customerName={order.customer?.name || order.customerPhone || "Customer"}
                                                    />
                                                    <div className="w-px bg-gray-200 mx-1"></div>
                                                </>
                                            )}

                                            {/* Status Actions */}
                                            {order.status !== 'COMPLETED' && (
                                                <form action={async () => {
                                                    "use server";
                                                    await updateStatusWithStore(order.id, 'COMPLETED');
                                                }}>
                                                    <button title="Mark Completed" className="p-2 hover:bg-green-100 text-gray-400 hover:text-green-600 rounded-lg transition">
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                </form>
                                            )}

                                            {order.status !== 'CANCELLED' && (
                                                <form action={async () => {
                                                    "use server";
                                                    await updateStatusWithStore(order.id, 'CANCELLED');
                                                }}>
                                                    <button title="Cancel Order" className="p-2 hover:bg-yellow-100 text-gray-400 hover:text-yellow-600 rounded-lg transition">
                                                        <XCircle size={18} />
                                                    </button>
                                                </form>
                                            )}

                                            <div className="w-px bg-gray-200 mx-1"></div>

                                            <form action={async () => {
                                                "use server";
                                                await deleteOrderWithStore(order.id);
                                            }}>
                                                <button title="Delete" className="p-2 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-lg transition">
                                                    <Trash2 size={18} />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
