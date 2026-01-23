"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Plus, Home, Heart, User, SlidersHorizontal, ArrowRight, UserCircle2, Zap } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import CartDrawer from "./CartDrawer";
import { useLikesStore } from "@/store/likes";

// Quick augmentation for the scroll ref hack
declare global {
    interface Window {
        categoryScrollContainer?: HTMLDivElement;
    }
}

function ProductCard({ product, storeSlug }: { product: any; storeSlug: string }) {
    const addItem = useCartStore((state) => state.addItem);
    const toggleCart = useCartStore((state) => state.toggleCart);
    const { toggleLike, items: likedItems } = useLikesStore();

    // Check if liked (using array check instead of selector function to ensure hydration updates trigger re-render)
    const isLiked = likedItems.some(item => item.id === product.id);

    const price = product.priceRetail ? Number(product.priceRetail) : 0;

    return (
        <div className="group relative flex flex-col h-full animate-in fade-in zoom-in duration-300">
            <Link href={`/${storeSlug}/product/${product.id}`} className="block">
                <div className="relative aspect-[4/5] bg-gray-100 rounded-[28px] overflow-hidden mb-3 shadow-sm border border-gray-100">
                    {/* Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image || "/placeholder.png"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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
                        className={`absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center transition-all z-10 active:scale-90 ${isLiked
                            ? "bg-white text-red-500 shadow-lg shadow-red-500/20"
                            : "bg-white/60 text-gray-700 hover:bg-white hover:text-red-500"
                            }`}
                    >
                        <Heart size={18} className={isLiked ? "fill-current" : ""} strokeWidth={2.5} />
                    </button>

                    {/* Price Tag */}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full z-10 shadow-lg shadow-black/5">
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
                        className="absolute bottom-3 right-3 bg-gray-900 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-gray-900/20 hover:scale-110 active:scale-95 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
                    >
                        <Plus size={18} strokeWidth={3} />
                    </button>
                </div>

                <div className="space-y-1.5 px-1">
                    <h3 className="font-medium text-gray-900 text-[13px] leading-tight line-clamp-2 group-hover:text-brand-purple transition-colors">{product.name}</h3>
                    {/* Store Name & Colors */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{product.category || 'General'}</span>
                        {/* Mock Colors */}
                        <div className="flex -space-x-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 border border-white"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 border border-white"></div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default function StoreInterface({ initialProducts, storeId, storeSlug, storeName }: { initialProducts: any[], storeId: string, storeSlug: string, storeName: string }) {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortMode, setSortMode] = useState<'newest' | 'price_asc' | 'price_desc'>("newest");
    const cartItems = useCartStore((state) => state.items);
    const toggleCart = useCartStore((state) => state.toggleCart);
    const isCartOpen = useCartStore((state) => state.isOpen);
    const [mounted, setMounted] = useState(false);

    // Header Scroll Effect
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
        <div className="min-h-screen bg-white pb-32">
            {/* Header / Top Bar */}
            <div className={`sticky top-0 z-30 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm pt-2 pb-2' : 'bg-white pt-6 pb-2'}`}>
                <div className="px-5 mb-4 flex justify-between items-center">
                    {/* Logo / Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center font-medium text-xs shadow-lg shadow-gray-200">
                            <Zap size={18} className="fill-white" />
                        </div>
                        <span className={`font-medium text-lg tracking-tight text-gray-900 transition-opacity ${isScrolled ? 'opacity-100' : 'opacity-100'}`}>
                            {storeName}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            aria-label="Sort products"
                            onClick={() => {
                                const next = sortMode === 'newest' ? 'price_asc' : sortMode === 'price_asc' ? 'price_desc' : 'newest';
                                setSortMode(next);
                            }}
                            className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all ${sortMode !== 'newest' ? 'bg-gray-900 border-gray-900 text-white' : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-600'
                                }`}
                        >
                            <SlidersHorizontal size={18} />
                        </button>

                        <button aria-label="Cart" title="Cart" className="relative w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all group" onClick={toggleCart}>
                            <ShoppingBag className="text-gray-900 group-hover:scale-110 transition-transform" size={18} />
                            {mounted && cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-medium border-2 border-white animate-in zoom-in shadow-sm">
                                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="px-5 mb-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                        <input
                            onChange={(e) => setSearchQuery(e.target.value)}
                            value={searchQuery}
                            type="text"
                            placeholder="Find your favorites..."
                            className="w-full bg-gray-50/80 hover:bg-gray-50 focus:bg-white rounded-[20px] py-3.5 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none border border-transparent focus:border-purple-100 focus:ring-4 focus:ring-purple-500/10 transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="relative group">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    <div
                        ref={(el) => { if (el) window.categoryScrollContainer = el; }}
                        className="pl-5 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth pb-2"
                    >
                        <div className="flex gap-2.5 pr-10">
                            {["All", "Diapers", "Feeding", "Clothing", "Toys", "Health", "Bedding", "Bundles"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={(e) => {
                                        setActiveCategory(cat);
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
                                    className={`px-5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-300 flex-shrink-0 border ${activeCategory === cat
                                        ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200 scale-105"
                                        : "bg-white text-gray-500 border-gray-100/50 hover:border-gray-200 hover:bg-gray-50"
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
            <div className="px-5">
                {/* Section Header */}
                <div className="flex justify-between items-center mb-6 mt-2">
                    <h2 className="text-lg font-medium text-gray-900 tracking-tight flex items-center gap-2">
                        {activeCategory === "All" ? "Trending Now" : activeCategory}
                        <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{filteredProducts.length}</span>
                    </h2>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                    {filteredProducts.map(p => (
                        <ProductCard key={p.id} product={p} storeSlug={storeSlug} />
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-2 py-24 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <ShoppingBag className="text-gray-300" size={32} />
                            </div>
                            <h3 className="font-medium text-gray-900 text-lg mb-2">No products found</h3>
                            <p className="text-gray-400 text-sm max-w-[200px]">Try adjusting your search or filters to find what you're looking for.</p>
                            <button
                                onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                                className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium text-sm shadow-xl shadow-gray-200 hover:scale-105 transition-transform"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Nav - Floating Pill */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
                <nav className="pointer-events-auto bg-gray-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] rounded-full px-2 py-2 flex items-center gap-1">
                    <button
                        title="Home"
                        aria-label="Home"
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            setActiveCategory("All");
                            setSearchQuery("");
                        }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${activeCategory === 'All' && !searchQuery ? 'bg-white text-black shadow-lg scroll-smooth' : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        <Home size={20} className={activeCategory === 'All' && !searchQuery ? "fill-current" : ""} />
                    </button>

                    <button
                        title="Cart"
                        aria-label="Cart"
                        onClick={toggleCart}
                        className="relative w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                        <ShoppingBag size={20} />
                        {mounted && cartItems.length > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1a1a1a]" />
                        )}
                    </button>

                    <button
                        aria-label="Wishlist"
                        onClick={() => router.push(`/${storeSlug}/wishlist`)} // Hypothetical wishlist route
                        className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                        <Heart size={20} />
                    </button>

                    <Link
                        href={`/${storeSlug}/admin`}
                        className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                        <UserCircle2 size={20} />
                    </Link>
                </nav>
            </div>

            {/* Global Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={toggleCart} storeId={storeId} storeName={storeName} />
        </div>
    );
}
