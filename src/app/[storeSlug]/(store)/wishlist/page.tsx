"use client";

import { useLikesStore } from "@/store/likes";
import { useCartStore } from "@/store/cart";
import { ArrowLeft, Heart, ShoppingBag, Trash2, Plus, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

// Reusing the ProductCard aesthetic but adapted for Wishlist
function WishlistProductCard({ product, storeSlug }: { product: any; storeSlug: string }) {
    const addItem = useCartStore((state) => state.addItem);
    const toggleCart = useCartStore((state) => state.toggleCart);
    const { toggleLike, items: likedItems } = useLikesStore();

    // Ideally checks if still liked, but in wishlist it should be
    const isLiked = likedItems.some(item => item.id === product.id);

    // If removed from wishlist, it disappears from list (parent handles this via reactive store)

    return (
        <div className="group relative flex flex-col h-full animate-in fade-in zoom-in duration-300">
            <Link href={`/${storeSlug}/product/${product.id}`} className="block">
                <div className="relative aspect-[4/5] bg-gray-100 rounded-[28px] overflow-hidden mb-3 shadow-sm border border-gray-100">
                    {/* Image */}
                    {product.image ? (
                        <div className="relative w-full h-full">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                            <ShoppingBag size={40} />
                        </div>
                    )}


                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Remove/Unlike Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleLike(product);
                        }}
                        title="Remove from Wishlist"
                        className="absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center transition-all z-10 active:scale-90 bg-white text-red-500 shadow-lg shadow-red-500/20 hover:bg-gray-100"
                    >
                        {/* Show Trash on Hover? Or just filled Heart? Let's stick to Heart logic but clearer it removes */}
                        <Heart size={18} className="fill-current" strokeWidth={2.5} />
                    </button>

                    {/* Price Tag */}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-gray-900 text-xs font-black px-3 py-1.5 rounded-full z-10 shadow-lg shadow-black/5">
                        ₵{Number(product.priceRetail).toFixed(0)}
                    </div>

                    {/* Add to Cart Overlay */}
                    <button
                        title="Add to Cart"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem({ ...product, priceRetail: Number(product.priceRetail) });
                            toggleCart();
                        }}
                        className="absolute bottom-3 right-3 bg-gray-900 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-gray-900/20 hover:scale-110 active:scale-95 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
                    >
                        <Plus size={18} strokeWidth={3} />
                    </button>
                </div>

                <div className="space-y-1.5 px-1">
                    <h3 className="font-bold text-gray-900 text-[13px] leading-tight line-clamp-2 group-hover:text-brand-purple transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{product.category || 'General'}</span>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default function WishlistPage() {
    const { items } = useLikesStore();
    const params = useParams();
    const storeSlug = params.storeSlug as string;
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-white" />; // Prevent hydration mismatch
    }

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 pt-6 pb-4 px-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors"
                            title="Go Back"
                            aria-label="Go Back"
                        >
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </button>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">My Wishlist</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-xs">
                            {items.length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 pt-8">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center shadow-inner">
                            <Heart size={40} className="text-gray-300" />
                        </div>
                        <div className="space-y-2 max-w-xs">
                            <h2 className="text-xl font-black text-gray-900">Your wishlist is empty</h2>
                            <p className="text-gray-400 font-medium text-sm">Tap the heart icon on products you love to save them for later.</p>
                        </div>
                        <Link
                            href={`/${storeSlug}`}
                            className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/10"
                        >
                            Start Exploring
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        {items.map((item) => (
                            <WishlistProductCard
                                key={item.id}
                                product={item}
                                storeSlug={storeSlug}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
