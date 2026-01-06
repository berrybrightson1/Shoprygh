"use client";

import { Drawer } from "vaul";
import { ShoppingBag, X, ArrowRight, History } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    priceRetail: number | string; // Handle Prisma Decimal
}

interface Order {
    id: string;
    customerName: string | null;
    total: number | string; // Handle Prisma Decimal
    status: string;
    createdAt: Date | string;
    items: OrderItem[];
}

export default function MobileActivityDrawer({ orders, storeSlug }: { orders: any[], storeSlug: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Drawer.Root open={isOpen} onOpenChange={setIsOpen} direction="bottom">
            <Drawer.Trigger asChild>
                <button
                    className="md:hidden flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-full active:scale-95 transition-all mb-4"
                >
                    <History size={16} className="text-gray-600" />
                    <span className="text-xs font-bold text-gray-700">View Activity</span>
                    {orders.length > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {orders.length}
                        </span>
                    )}
                </button>
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-gray-50 flex flex-col rounded-t-[32px] z-50 focus:outline-none">
                    {/* Handle */}
                    <div className="w-full flex items-center justify-center pt-4 pb-2">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-6 py-2 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">System Activity</h2>
                            <p className="text-xs text-gray-500 font-bold">Recent orders and updates</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 bg-gray-200 rounded-full text-gray-500 hover:bg-gray-300 transition-colors"
                            title="Close"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                                <ShoppingBag size={48} className="opacity-20 mb-4" />
                                <p className="font-bold text-gray-900">No activity yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order: any) => (
                                    <Link
                                        key={order.id}
                                        href={`/${storeSlug}/admin/orders/${order.id}`}
                                        className="block bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan/20 to-blue-50 text-brand-cyan flex items-center justify-center font-black">
                                                    {order.customerName?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{order.customerName || "Guest"}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">
                                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900">₵{Number(order.total).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pl-[52px]">
                                            <span className="text-xs text-gray-500 font-medium">{order.items.length} items</span>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                                                order.status === 'PENDING' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                    'bg-gray-50 text-gray-600 border-gray-100'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div className="pt-4">
                            <Link
                                href={`/${storeSlug}/admin/orders`}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition"
                                onClick={() => setIsOpen(false)}
                            >
                                View All History
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
