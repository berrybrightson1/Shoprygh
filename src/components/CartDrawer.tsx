"use client";

import { useCartStore } from "@/store/cart";
import { Drawer } from "vaul";
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CartDrawer({ isOpen, onClose, storeId }: { isOpen?: boolean; onClose?: () => void; storeId?: string }) {
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
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        let phone = customerPhone.trim();
        phone = phone.replace(/[\s-]/g, '');

        if (phone.length < 9) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setIsLoading(true);

        // Construct WhatsApp Message
        const message = `*New Order from Shopry App*\n\n` +
            cart.map(item => `• ${item.name} (x${item.quantity}) - ₵${(Number(item.priceRetail) * item.quantity).toFixed(2)}`).join("\n") +
            `\n\n*Total: ₵${cartTotal.toFixed(2)}*` +
            `\n\n*Customer Details:*\nPhone: ${phone}`;

        const ownerPhone = "233249999065"; // Default/Fallback
        const whatsappUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
        setIsLoading(false);
        clearCart();
        effectiveOnClose();
    };

    return (
        <Drawer.Root open={effectiveIsOpen} onOpenChange={(open: boolean) => !open && effectiveOnClose()} direction="right">
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 transition-opacity" />
                <Drawer.Content className="fixed bottom-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-xl outline-none transition-transform sm:max-w-lg">

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            <h2 className="font-bold text-lg">Your Bag ({cart.length})</h2>
                        </div>
                        <button
                            onClick={() => effectiveOnClose()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
                                <ShoppingBag className="w-16 h-16 opacity-20" />
                                <p className="font-medium">Your bag is empty</p>
                                <button
                                    onClick={() => effectiveOnClose()}
                                    className="text-black font-bold underline underline-offset-4"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ShoppingBag size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="font-black text-sm">₵{Number(item.priceRetail).toFixed(2)}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-0.5 h-8">
                                                <button
                                                    onClick={() => decreaseItem(item.id)}
                                                    className="w-7 h-full flex items-center justify-center hover:bg-white hover:shadow-sm rounded transition disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => addItem(item)}
                                                    className="w-7 h-full flex items-center justify-center hover:bg-white hover:shadow-sm rounded transition"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-100 p-4 space-y-4 bg-white">
                            <div className="space-y-4 mb-4">
                                <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider">
                                    Contact Information
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="tel"
                                        placeholder="Phone Number (Required)"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        required
                                    />
                                    <p className="text-[10px] text-gray-400">
                                        We'll use this to contact you about your order.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-dashed border-gray-200">
                                <div className="flex items-center justify-between text-gray-500 text-sm">
                                    <span>Subtotal</span>
                                    <span>₵{cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xl font-black">
                                    <span>Total</span>
                                    <span>₵{cartTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isLoading || customerPhone.length < 9}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-900 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Processing..." : "Checkout via WhatsApp"}
                                {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </div>
                    )}
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
