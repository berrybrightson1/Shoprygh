"use client";

import { useCartStore } from "@/store/cart";
import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    priceRetail: number;
    category: string;
    image: string | null;
}

export default function AddToCartBar({ product }: { product: Product }) {
    const { addItem, toggleCart, items } = useCartStore();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            name: product.name,
            priceRetail: Number(product.priceRetail),
            category: product.category,
            image: product.image
        });

        // Visual feedback
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);

        // Open cart to show user
        // toggleCart(); // User requested to keep it closed: "saved for later shopping"
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-area-bottom">
            <div className="max-w-xl mx-auto flex gap-4">
                <button
                    onClick={handleAddToCart}
                    className={`flex-1 font-bold py-4 rounded-full shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 ${isAdded
                        ? "bg-green-600 text-white shadow-green-200"
                        : "bg-black text-white shadow-black/20"
                        }`}
                >
                    {isAdded ? <Check size={20} /> : (
                        <div className="relative">
                            <ShoppingBag size={20} />
                            {/* Badge */}
                            <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                {items.reduce((acc, i) => acc + i.quantity, 0)}
                            </span>
                        </div>
                    )}
                    {isAdded ? "Added to Cart" : `Add to Cart - ₵${Number(product.priceRetail).toFixed(2)}`}
                </button>
            </div>
        </div>
    );
}
