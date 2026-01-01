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
            <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center relative">
                <ShoppingBag size={18} />
            </button>
        );
    }

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <button
            onClick={toggleCart}
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center relative hover:bg-gray-800 transition"
        >
            <ShoppingBag size={18} />
            {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white animate-in zoom-in">
                    {itemCount}
                </span>
            )}
        </button>
    );
}
