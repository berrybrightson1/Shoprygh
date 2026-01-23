"use client";

import { useCartStore } from "@/store/cart";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

export default function CartHeaderButton() {
    const { items, toggleCart } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) {
        return (
            <button title="Shopping cart" className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center relative">
                <ShoppingBag size={18} />
            </button>
        );
    }

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <button
            onClick={toggleCart}
            title="Shopping cart"
            className="group relative w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20"
        >
            <ShoppingBag size={20} className="stroke-[2px]" />
            {mounted && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-medium border-2 border-white shadow-sm animate-in zoom-in spring-duration-300">
                    {itemCount}
                </span>
            )}
        </button>
    );
}
