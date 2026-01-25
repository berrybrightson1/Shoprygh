"use client";

import { useCartStore } from "@/store/cart";
import { Drawer } from "vaul";
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCurrencyStore } from "@/store/currency";
import { formatPrice, convertPrice } from "@/utils/currency";

export default function CartDrawer({ isOpen, onClose, storeId, storeName, storeOwnerPhone }: { isOpen?: boolean; onClose?: () => void; storeId?: string, storeName?: string, storeOwnerPhone?: string | null }) {
    // access store
    const cart = useCartStore(state => state.items);
    const isOpenStore = useCartStore(state => state.isOpen);
    const toggleCart = useCartStore(state => state.toggleCart);
    const addItem = useCartStore(state => state.addItem);
    const decreaseItem = useCartStore(state => state.decreaseItem);
    const removeItem = useCartStore(state => state.removeItem);
    const clearCart = useCartStore(state => state.clearCart);
    const currency = useCurrencyStore(state => state.currency);

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

        // Check if store has WhatsApp number configured (or use fallback)
        // if (!storeOwnerPhone) {
        //     toast.error("This store hasn't set up WhatsApp checkout yet. Please contact the store owner.");
        //     return;
        // }

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

        try {
            // Create order in database first
            const { createOrder } = await import(`@/app/[storeSlug]/(store)/actions`);

            const orderData = cart.map(item => ({
                id: item.id,
                name: item.name,
                priceRetail: Number(item.priceRetail),
                quantity: item.quantity
            }));

            const result = await createOrder(
                storeId || '',
                orderData,
                cartTotal,
                `+233${phoneCleanup}`,
                undefined, // no coupon for now
                customerName.trim() // customer name
            );

            if (!result.success) {
                throw new Error('Failed to create order');
            }

            // Construct WhatsApp Message
            const message = `*New Order from ${storeName || 'Shopry App'}*\n\n` +
                `*Customer:* ${customerName.trim()}\n` +
                `*Phone:* +233${phoneCleanup}\n` +
                `*Order ID:* #${result.orderId.slice(-6)}\n\n` +
                `*Order Details:*\n` +
                cart.map(item => `• ${item.name} (x${item.quantity}) - ₵${(Number(item.priceRetail) * item.quantity).toFixed(2)}`).join("\n") +
                `\n\n*Total: ₵${cartTotal.toFixed(2)}*`;

            // Use store owner's phone
            const ownerPhone = storeOwnerPhone || "233551171353";
            const whatsappUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(message)}`;

            // Open WhatsApp
            window.open(whatsappUrl, '_blank');

            // Show success message
            toast.success("Order created successfully!");

            // Clear cart and close drawer
            clearCart();
            effectiveOnClose();
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error("Failed to create order. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Drawer.Root open={effectiveIsOpen} onOpenChange={(open: boolean) => !open && effectiveOnClose()} direction="right">
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50 transition-opacity backdrop-blur-sm" />
                <Drawer.Content className="fixed inset-y-0 right-0 w-full h-[100dvh] max-w-md bg-white z-50 flex flex-col shadow-2xl outline-none transition-transform sm:max-w-lg border-l border-gray-100">
                    <Drawer.Title className="sr-only">Your Cart</Drawer.Title>

                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white">
                                <ShoppingBag size={14} strokeWidth={2} />
                            </div>
                            <h2 className="font-medium text-lg text-gray-900 tracking-tight">Your Bag ({cart.length})</h2>
                        </div>
                        <button
                            onClick={() => effectiveOnClose()}
                            title="Close Cart"
                            aria-label="Close Cart"
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                        >
                            <X className="w-6 h-6 text-gray-400" strokeWidth={2} />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
                                <ShoppingBag className="w-20 h-20 opacity-10" />
                                <p className="font-medium text-gray-900">Your bag is empty</p>
                                <button
                                    onClick={() => effectiveOnClose()}
                                    className="text-gray-900 font-medium underline underline-offset-4 hover:text-gray-700"
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
                                            <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-relaxed">{item.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="font-medium text-sm text-gray-900">{formatPrice(Number(item.priceRetail), currency)}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center bg-white rounded-xl border border-gray-300 p-1 h-9 shadow-sm">
                                                <button
                                                    onClick={() => decreaseItem(item.id)}
                                                    title="Decrease quantity"
                                                    aria-label="Decrease quantity"
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-100 rounded-lg transition disabled:opacity-30"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={14} className="text-gray-900" strokeWidth={2} />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => addItem(item)}
                                                    title="Increase quantity"
                                                    aria-label="Increase quantity"
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-100 rounded-lg transition"
                                                >
                                                    <Plus size={14} className="text-gray-900" strokeWidth={2} />
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



                        {cart.length > 0 && (
                            <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-medium uppercase text-gray-900 tracking-widest">
                                        Contact Information
                                    </label>
                                    <span className="text-[10px] font-medium text-gray-500 bg-gray-50 border border-gray-100/50 px-2 py-0.5 rounded-full">
                                        For {storeName || 'Store'}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Business Name / Buyer Name (Required)"
                                        className="w-full px-4 py-3.5 bg-white border border-gray-200/50 rounded-xl font-medium text-gray-900 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 transition placeholder:text-gray-400 placeholder:font-normal"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        required
                                    />

                                    <div className="relative flex items-center">
                                        <div className="absolute left-0 top-0 bottom-0 bg-gray-50 border border-r-0 border-gray-200/50 rounded-l-xl px-3 flex items-center justify-center font-medium text-gray-400 text-sm w-[60px]">
                                            +233
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="XX XXX XXXX"
                                            className="w-full pl-[72px] pr-4 py-3.5 bg-white border border-gray-200/50 rounded-xl font-medium text-gray-900 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 transition placeholder:text-gray-400 placeholder:font-normal"
                                            value={customerPhone}
                                            onChange={(e) => {
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
                        )}

                        {cart.length > 0 && (
                            <div className="border-t border-gray-100 p-5 space-y-6 bg-white safe-area-bottom pb-8 sm:pb-5">
                                <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-100">
                                    <div className="flex items-center justify-between text-gray-500 font-medium">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(cartTotal, currency)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xl font-medium text-gray-900">
                                        <span>Total</span>
                                        <span>{formatPrice(cartTotal, currency)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={isLoading || !customerName.trim() || customerPhone.length < 9}
                                    className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-3 hover:bg-[#20bd5a] active:scale-95 transition shadow-xl shadow-[#25D366]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    {isLoading ? "Processing..." : "Checkout via WhatsApp"}
                                    {!isLoading && <ArrowRight size={20} strokeWidth={2} />}
                                </button>
                            </div>
                        )}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
