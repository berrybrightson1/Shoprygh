"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Plus, Home, Heart, User, SlidersHorizontal, ArrowRight, UserCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import CartDrawer from "./CartDrawer";

// Quick augmentation for the scroll ref hack
declare global {
    interface Window {
        categoryScrollContainer?: HTMLDivElement;
    }
}

import { useLikesStore } from "@/store/likes";

function ProductCard({ product }: { product: any }) {
    const addItem = useCartStore((state) => state.addItem);
    const toggleCart = useCartStore((state) => state.toggleCart);
    const { toggleLike, items: likedItems } = useLikesStore();

    // Check if liked (using array check instead of selector function to ensure hydration updates trigger re-render)
    const isLiked = likedItems.some(item => item.id === product.id);

    const price = product.priceRetail ? Number(product.priceRetail) : 0;

    return (
        <div className="group relative flex flex-col h-full animate-in fade-in zoom-in duration-300">
            <Link href={`/product/${product.id}`} className="block">
                <div className="relative aspect-[4/5] bg-gray-100 rounded-[24px] overflow-hidden mb-3">
                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image || "/placeholder.png"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 shadow-sm" alt={product.name} />

                    {/* Heart Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleLike({
                                id: product.id,
                                name: product.name,
                                image: product.image,
                                priceRetail: price,
                                category: product.category || 'General'
                            });
                        }}
                        title={isLiked ? "Unlike" : "Like"}
                        className={`absolute top-3 right-3 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition z-10 ${isLiked
                            ? "bg-red-50 text-red-500 hover:bg-red-100"
                            : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
                            }`}
                    >
                        <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                    </button>

                    {/* Price Tag */}
                    <div className="absolute bottom-3 left-3 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">
                        ₵{price.toFixed(0)}
                    </div>

                    {/* Add to Cart Overlay */}
                    <button
                        title="Add to Cart"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem({ ...product, priceRetail: price });
                            toggleCart();
                        }}
                        className="absolute bottom-3 right-3 bg-white text-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="space-y-1 px-1">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-brand-orange transition-colors">{product.name}</h3>
                </div>
            </Link>

            <div className="flex items-center gap-1.5 pt-1">
                <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-black">A</span>
                </div>
                <span className="text-xs text-gray-900 font-medium">Anaya Store</span>

                {/* Color Swatches (Mock) */}
                <div className="flex -space-x-1 ml-auto">
                    <div className="w-3 h-3 rounded-full bg-brand-cyan border border-white"></div>
                    <div className="w-3 h-3 rounded-full bg-brand-orange border border-white"></div>
                </div>
            </div>
        </div>
    );
}

export default function StoreInterface({ initialProducts, storeId }: { initialProducts: any[], storeId: string }) {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortMode, setSortMode] = useState<'newest' | 'price_asc' | 'price_desc'>("newest");
    const cartItems = useCartStore((state) => state.items);
    const toggleCart = useCartStore((state) => state.toggleCart);
    const isCartOpen = useCartStore((state) => state.isOpen);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredProducts = initialProducts
        .filter(p => {
            const matchesCat = activeCategory === "All" || p.category === activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        })
        .sort((a, b) => {
            if (sortMode === 'price_asc') return Number(a.priceRetail) - Number(b.priceRetail);
            if (sortMode === 'price_desc') return Number(b.priceRetail) - Number(a.priceRetail);
            return 0; // Default matches DB order (created desc)
        });

    return (
        <>
            {/* Header / Top Bar */}
            <div className="pt-6 pb-2 bg-white sticky top-0 z-30">
                <div className="px-5 mb-4 flex justify-between items-center">
                    {/* Logo / Menu */}
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">All</div>

                    {/* Centered or Right Actions */}
                    <div className="flex gap-2">
                        {/* Cart */}
                        <button title="Cart" className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition" onClick={toggleCart}>
                            <ShoppingBag className="text-gray-900" size={18} />
                            {mounted && cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white animate-in zoom-in">
                                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="px-5 mb-4 flex gap-3 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            onChange={(e) => setSearchQuery(e.target.value)}
                            value={searchQuery}
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-gray-50 rounded-full py-3 pl-12 pr-4 text-sm font-medium outline-none border border-transparent focus:border-gray-200 transition-all placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        onClick={() => {
                            const next = sortMode === 'newest' ? 'price_asc' : sortMode === 'price_asc' ? 'price_desc' : 'newest';
                            setSortMode(next);
                        }}
                        className={`w-11 h-11 flex items-center justify-center rounded-full border transition ${sortMode !== 'newest' ? 'bg-black border-black text-white' : 'bg-gray-50 border-transparent hover:border-gray-200 text-gray-600'
                            }`}
                        title={`Sort: ${sortMode === 'newest' ? 'Newest' : sortMode === 'price_asc' ? 'Price: Low to High' : 'Price: High to Low'}`}
                    >
                        <SlidersHorizontal size={18} />
                    </button>
                </div>

                {/* Categories */}
                <div className="relative group">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    <div
                        ref={(el) => { if (el) window.categoryScrollContainer = el; }}
                        className="pl-5 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
                    >
                        <div className="flex gap-3 py-1 pr-12">
                            {["All", "Diapers", "Feeding", "Clothing", "Toys", "Health", "Bedding", "Bundles"].map((cat) => (
                                <button
                                    key={cat}
                                    title={cat}
                                    onClick={(e) => {
                                        setActiveCategory(cat);
                                        // Auto-scroll to center
                                        const container = window.categoryScrollContainer;
                                        const target = e.currentTarget;
                                        if (container && target) {
                                            const containerWidth = container.offsetWidth;
                                            const targetLeft = target.offsetLeft;
                                            const targetWidth = target.offsetWidth;
                                            const scrollLeft = targetLeft - (containerWidth / 2) + (targetWidth / 2);
                                            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                                        }
                                    }}
                                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex-shrink-0 ${activeCategory === cat
                                        ? "bg-black text-white shadow-lg scale-105"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-32">

                {/* Section Header */}
                <div className="flex justify-between items-end mb-4 mt-2">
                    <h2 className="text-xl font-bold text-gray-900">
                        {activeCategory === "All" ? "Popular Products" : activeCategory}
                    </h2>
                    <button title="See All" className="text-xs font-bold text-pink-500 hover:opacity-80 flex items-center gap-1">
                        See All <ArrowRight size={12} />
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-y-8 gap-x-5 pb-10">
                    {filteredProducts.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-2 text-center py-20 text-gray-400">
                            <ShoppingBag className="mx-auto mb-2 opacity-20" size={48} />
                            <p>No products found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Nav - Floating Style */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-full px-8 py-4 flex items-center gap-10 z-40">
                <button
                    title="Home"
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setActiveCategory("All");
                        setSearchQuery("");
                    }}
                    className="flex flex-col items-center gap-1 text-gray-900 transition hover:scale-110"
                >
                    <Home size={22} strokeWidth={2.5} />
                    <div className={`w-1 h-1 bg-black rounded-full mt-1 transition-opacity ${activeCategory === 'All' ? 'opacity-100' : 'opacity-0'}`}></div>
                </button>

                <button
                    title="Cart"
                    onClick={toggleCart}
                    className="relative flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition hover:scale-110"
                >
                    <ShoppingBag size={22} />
                    {mounted && cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white animate-in zoom-in">
                            {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                        </span>
                    )}
                </button>

                <button
                    title="Profile"
                    onClick={() => router.push('/admin/inventory')}
                    className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition hover:scale-110"
                >
                    <UserCircle2 size={24} />
                </button>
            </nav>

            {/* Global Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={toggleCart} storeId={storeId} />
        </>
    );
}
