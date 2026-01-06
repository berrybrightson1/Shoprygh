"use client";

import { useCartStore } from "@/store/cart";
import { Drawer } from "vaul";
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CartDrawer({ isOpen, onClose, storeId, storeName }: { isOpen?: boolean; onClose?: () => void; storeId?: string, storeName?: string }) {
    // access store
    const cart = useCartStore(state => state.items);
    const isOpenStore = useCartStore(state => state.isOpen);
    const toggleCart = useCartStore(state => state.toggleCart);
    const addItem = useCartStore(state => state.addItem);
    const decreaseItem = useCartStore(state => state.decreaseItem);
    const removeItem = useCartStore(state => state.removeItem);
    const clearCart = useCartStore(state => state.clearCart);

    // If controlled via props, use props; otherwise use store state
    // Actually StoreInterface controls it via store state but wraps it in <CartDrawer isOpen={isCartOpen} />
    // But StoreInterface gets isCartOpen FROM the store too.
    // So we can just rely on store state if we want, or respect props.
    // Given the previous code ignored props, let's respect the store for now as primary source of truth to match StoreInterface.

    // Derived state
    const effectiveIsOpen = isOpen !== undefined ? isOpen : isOpenStore;
    const effectiveOnClose = onClose || toggleCart;

    const cartTotal = cart.reduce((acc, item) => acc + (Number(item.priceRetail) * item.quantity), 0);

    const [customerPhone, setCustomerPhone] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        // Smart Phone Logic
        let phoneCleanup = customerPhone.replace(/\D/g, ''); // Remove non-digits
        if (phoneCleanup.startsWith('0') && phoneCleanup.length === 10) {
            phoneCleanup = phoneCleanup.substring(1); // Remove leading 0 if 10 digits
        }

        // Strict Ghana Number Check (9 digits after +233)
        if (phoneCleanup.length !== 9) {
            toast.error("Please enter a valid 9-digit Ghana number (e.g. 24XXXXXXX)");
            return;
        }

        if (!customerName.trim()) {
            toast.error("Please enter your name or business name");
            return;
        }

        setIsLoading(true);

        // Construct WhatsApp Message
        const message = `*New Order from ${storeName || 'Shopry App'}*\n\n` +
            `*Customer:* ${customerName.trim()}\n` +
            `*Phone:* +233${phoneCleanup}\n\n` +
            `*Order Details:*\n` +
            cart.map(item => `• ${item.name} (x${item.quantity}) - ₵${(Number(item.priceRetail) * item.quantity).toFixed(2)}`).join("\n") +
            `\n\n*Total: ₵${cartTotal.toFixed(2)}*`;

        // HARDCODED GLOBAL NUMBER for all stores as requested
        const ownerPhone = "233551171353";
        // Use the cleaned up full international format for the link if needed, or just display it in message
        // The ownerPhone is where the message is SENT TO.

        const whatsappUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
        setIsLoading(false);
        clearCart();
        effectiveOnClose();
    };

    return (
        <Drawer.Root open={effectiveIsOpen} onOpenChange={(open: boolean) => !open && effectiveOnClose()} direction="right">
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 transition-opacity backdrop-blur-sm" />
                <Drawer.Content className="fixed bottom-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl outline-none transition-transform sm:max-w-lg border-l border-gray-100">
                    <Drawer.Title className="sr-only">Your Cart</Drawer.Title>

                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                                <ShoppingBag size={14} strokeWidth={3} />
                            </div>
                            <h2 className="font-black text-xl text-gray-900 tracking-tight">Your Bag ({cart.length})</h2>
                        </div>
                        <button
                            onClick={() => effectiveOnClose()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                        >
                            <X className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
                                <ShoppingBag className="w-20 h-20 opacity-10" />
                                <p className="font-bold text-gray-900">Your bag is empty</p>
                                <button
                                    onClick={() => effectiveOnClose()}
                                    className="text-black font-black underline underline-offset-4 hover:text-gray-700"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 group">
                                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-50 shrink-0 border border-gray-200 group-hover:border-gray-300 transition-colors">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ShoppingBag size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-2 text-sm leading-relaxed">{item.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="font-black text-base text-black">₵{Number(item.priceRetail).toFixed(2)}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center bg-white rounded-xl border border-gray-300 p-1 h-9 shadow-sm">
                                                <button
                                                    onClick={() => decreaseItem(item.id)}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-100 rounded-lg transition disabled:opacity-30"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={14} className="text-gray-900" strokeWidth={2.5} />
                                                </button>
                                                <span className="w-8 text-center text-sm font-black text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => addItem(item)}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-100 rounded-lg transition"
                                                >
                                                    <Plus size={14} className="text-gray-900" strokeWidth={2.5} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-xl"
                                                title="Remove"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-100 p-5 space-y-6 bg-white safe-area-bottom">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-black uppercase text-gray-900 tracking-widest">
                                        Contact Information
                                    </label>
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        For {storeName || 'Store'}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {/* Name Input */}
                                    <input
                                        type="text"
                                        placeholder="Business Name / Buyer Name (Required)"
                                        className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition placeholder:text-gray-400 placeholder:font-normal"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        required
                                    />

                                    {/* Phone Input with Prefix */}
                                    <div className="relative flex items-center">
                                        <div className="absolute left-0 top-0 bottom-0 bg-gray-50 border-2 border-r-0 border-gray-200 rounded-l-xl px-3 flex items-center justify-center font-black text-gray-500 text-sm w-[60px]">
                                            +233
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="XX XXX XXXX"
                                            className="w-full pl-[72px] pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition placeholder:text-gray-400 placeholder:font-normal"
                                            value={customerPhone}
                                            onChange={(e) => {
                                                // Only allow digits
                                                const val = e.target.value.replace(/\D/g, '');
                                                setCustomerPhone(val);
                                            }}
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                    <p className="text-[11px] font-medium text-gray-500">
                                        Complete these details to proceed to WhatsApp checkout.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-100">
                                <div className="flex items-center justify-between text-gray-500 font-medium">
                                    <span>Subtotal</span>
                                    <span>₵{cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-2xl font-black text-gray-900">
                                    <span>Total</span>
                                    <span>₵{cartTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isLoading || !customerName.trim() || customerPhone.length < 9}
                                className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#20bd5a] active:scale-95 transition shadow-xl shadow-[#25D366]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {isLoading ? "Processing..." : "Checkout via WhatsApp"}
                                {!isLoading && <ArrowRight size={20} strokeWidth={2.5} />}
                            </button>
                        </div>
                    )}
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
