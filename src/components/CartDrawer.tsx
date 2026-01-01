"use client";

import { X, Minus, Plus, ShoppingBag, MessageCircle } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useEffect, useState } from "react";
import { createOrder } from "@/app/(store)/actions";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { items, addItem, decreaseItem, removeItem, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const total = items.reduce((sum, item) => sum + (item.priceRetail * item.quantity), 0);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-50 transition-transform duration-300 ease-out transform ${isOpen ? "translate-y-0" : "translate-y-full"} max-h-[85vh] flex flex-col`}>

                <div className="w-full max-w-xl mx-auto flex flex-col h-full">

                    {/* Handle (Visual cue) */}
                    <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                    </div>

                    {/* Header */}
                    <div className="px-6 pb-4 flex justify-between items-center border-b border-gray-50">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                            My Bag <span className="text-brand-orange text-sm font-normal">({items.length} items)</span>
                        </h2>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition text-gray-900">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag className="text-gray-400" size={32} />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Your bag is empty</h3>
                                <p className="text-sm text-gray-700 mb-6">Looks like you haven't added anything yet.</p>
                                <button onClick={onClose} className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-bold shadow-lg hover:scale-105 transition">
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="flex gap-4 animate-in slide-in-from-bottom-2 duration-500">
                                    {/* Image */}
                                    <div className="w-20 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.image || "/placeholder.png"} alt={item.name} className="w-full h-full object-cover" />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{item.name}</h3>
                                                <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1 -mr-2">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-black mt-1 font-medium">{item.category}</p>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="text-sm font-extrabold text-black">₵{(item.priceRetail * item.quantity).toFixed(0)}</div>

                                            {/* Quantity Control */}
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
                                                <button
                                                    onClick={() => decreaseItem(item.id)}
                                                    className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50 text-gray-900"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="text-xs font-bold w-3 text-center text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => addItem(item)}
                                                    className="w-6 h-6 rounded-full bg-black text-white shadow-sm flex items-center justify-center hover:bg-gray-800 transition"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer (Total & Checkout) */}
                    {items.length > 0 && (
                        <div className="p-6 bg-white border-t border-gray-100 pb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-black font-bold text-sm">Total Estimate</span>
                                <span className="text-2xl font-black text-black">₵{total.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={async () => {
                                    setIsCheckingOut(true);
                                    try {
                                        // 1. Save "Ghost" Order
                                        const { orderId } = await createOrder(items, total);

                                        // 2. Construct Message
                                        let msg = `Hello Anaya's! I'd like to place an order:\n`;
                                        msg += `Order #${orderId.slice(-6).toUpperCase()}\n\n`;
                                        msg += `*Items:*\n`;

                                        items.forEach((item, index) => {
                                            msg += `${index + 1}. ${item.name}\n`;
                                            msg += `   Qty: ${item.quantity} | Price: ₵${item.priceRetail}\n\n`;
                                        });

                                        msg += `*Total Estimate:* ₵${total.toFixed(2)}`;

                                        // 3. Clear & Redirect
                                        clearCart();
                                        onClose();
                                        window.open(`https://wa.me/233551171353?text=${encodeURIComponent(msg)}`, '_blank');

                                    } catch (err) {
                                        alert("Something went wrong. Please try again.");
                                    } finally {
                                        setIsCheckingOut(false);
                                    }
                                }}
                                disabled={isCheckingOut}
                                className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {isCheckingOut ? (
                                    <span className="animate-pulse">Opening WhatsApp...</span>
                                ) : (
                                    <>Checkout on WhatsApp <MessageCircle size={20} /></>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
