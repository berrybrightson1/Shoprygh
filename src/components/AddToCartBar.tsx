"use client";

import { useCartStore } from "@/store/cart";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCurrencyStore } from "@/store/currency";
import { formatPrice, getCurrencySymbol } from "@/utils/currency";

interface Product {
    id: string;
    name: string;
    priceRetail: number;
    category: string;
    image: string | null;
}

export default function AddToCartBar({ product, storePhone, storeName }: { product: Product; storePhone?: string | null; storeName: string }) {
    const { addItem, toggleCart } = useCartStore(); // Added toggleCart
    const currency = useCurrencyStore((state) => state.currency);
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            priceRetail: Number(product.priceRetail),
            category: product.category,
            image: product.image
        }, quantity); // Pass quantity
        toast.success(`${quantity}x ${product.name} added to cart!`);
    };

    const handleWhatsAppCheckout = () => {
        // Add item(s) to cart logic
        addItem({
            id: product.id,
            name: product.name,
            priceRetail: Number(product.priceRetail),
            category: product.category,
            image: product.image
        }, quantity);

        // Open Cart Drawer for user to complete details
        toggleCart();
        toast.success("Added to bag. Please confirm details to checkout.");
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white border-t border-gray-100/50 safe-area-bottom z-50">
            <div className="max-w-xl mx-auto space-y-2 sm:space-y-3">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl sm:rounded-2xl p-2 sm:p-3">
                    <span className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Qty</span>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-all active:scale-95 text-sm"
                        >
                            −
                        </button>
                        <span className="text-base sm:text-lg font-black text-gray-900 w-6 sm:w-8 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-all active:scale-95 text-sm"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-gray-900 text-white font-bold py-3 sm:py-4 rounded-full shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Add to Cart</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                    <button
                        onClick={handleWhatsAppCheckout}
                        className="flex-1 sm:flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold py-3 sm:py-4 rounded-full shadow-xl shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <MessageCircle size={18} className="sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Order via WhatsApp</span>
                        <span className="sm:hidden">WhatsApp Order</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
