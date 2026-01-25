"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Plus, Home, Heart, User, SlidersHorizontal, ArrowRight, UserCircle2, Zap, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import CartDrawer from "./CartDrawer";
import { useLikesStore } from "@/store/likes";
import { useCurrencyStore } from "@/store/currency";
import { formatPrice } from "@/utils/currency";
import { toast } from "sonner";

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
    const currency = useCurrencyStore((state) => state.currency);

    // Check if liked (using array check instead of selector function to ensure hydration updates trigger re-render)
    const isLiked = likedItems.some(item => item.id === product.id);

    const price = product.priceRetail ? Number(product.priceRetail) : 0;

    // Carousel Logic
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [product.image, ...(product.gallery || [])].filter(Boolean);
    const hasMultipleImages = images.length > 1;

    // Auto-scroll for carousel if hovered (optional, but requested "slider" usually implies interaction)
    // For now, let's keep it simple with hover-zones or just standard displaying first image, 
    // but typically specialized sliders need state. 
    // Let's implement a simple click-to-advance or hover-to-slide.
    // Given the user wants "sliders", we'll do dots + touch slide or just buttons.
    // Let's go with a simple dot navigation + arrows for desktop.

    return (
        <div className="group relative flex flex-col h-full animate-in fade-in zoom-in duration-300">
            <Link href={`/${storeSlug}/product/${product.id}`} className="block h-full">
                {/* Image Container - Aspect Ratio 4/5, Full Coverage */}
                <div className="relative aspect-[4/5] bg-gray-100 rounded-[24px] overflow-hidden mb-3 border-none shadow-sm">
                    {/* Carousel Images */}
                    <div className="relative w-full h-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={images[currentImageIndex] || "/placeholder.png"}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt={product.name}
                        />
                    </div>

                    {/* Slider Navigation (only if multiple) */}
                    {hasMultipleImages && (
                        <>
                            {/* Discrete Navigation Buttons */}
                            {currentImageIndex > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation(); // Critical to prevent link click
                                        setCurrentImageIndex(prev => prev - 1);
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-gray-900 z-20 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={16} strokeWidth={2.5} />
                                </button>
                            )}

                            {currentImageIndex < images.length - 1 && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setCurrentImageIndex(prev => prev + 1);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-gray-900 z-20 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={16} strokeWidth={2.5} />
                                </button>
                            )}

                            {/* Dots */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                {images.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50 backdrop-blur-md'
                                            }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Low Stock Badge */}
                    {product.stockQty !== undefined && product.stockQty > 0 && product.stockQty < 10 && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 shadow-lg animate-pulse">
                            Only {product.stockQty} left!
                        </div>
                    )}

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
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full z-10 shadow-lg shadow-black/5 pointer-events-none">
                        {formatPrice(price, currency)}
                    </div>

                    {/* Add to Cart Overlay */}
                    <button
                        title="Add to Cart"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem({ ...product, priceRetail: price });
                            toast.success(`${product.name} added to cart!`, {
                                duration: 2000,
                            });
                        }}
                        // Boosted Z-Index to z-30 to stay above slider controls
                        className="absolute bottom-3 right-3 bg-gray-900 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-gray-900/20 hover:scale-110 active:scale-95 transition-all opacity-100 z-30"
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

export default function StoreInterface({ initialProducts, storeId, storeSlug, storeName, storeOwnerPhone }: { initialProducts: any[], storeId: string, storeSlug: string, storeName: string, storeOwnerPhone?: string | null }) {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortMode, setSortMode] = useState<'newest' | 'price_asc' | 'price_desc'>("newest");
    const cartItems = useCartStore((state) => state.items);
    const toggleCart = useCartStore((state) => state.toggleCart);
    const isCartOpen = useCartStore((state) => state.isOpen);
    const setStoreId = useCartStore((state) => state.setStoreId);
    const [mounted, setMounted] = useState(false);

    // Header Scroll Effect
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Initialize cart with current store ID
        setStoreId(storeId);
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [storeId, setStoreId]);

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
            <div className={`sticky top-0 z-30 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100/50 shadow-sm' : 'bg-white'}`}>
                <div className="max-w-[1600px] mx-auto px-5 lg:px-8 py-4 lg:py-5 flex justify-between items-center">
                    {/* Logo / Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center font-medium text-xs shadow-lg shadow-gray-200">
                            <Zap size={18} className="fill-white" />
                        </div>
                        <span className={`font-medium text-lg tracking-tight text-gray-900 transition-opacity ${isScrolled ? 'opacity-100' : 'opacity-100'}`}>
                            {storeName}
                        </span>
                    </div>

                    {/* Desktop Navigation (hidden on mobile) */}
                    <div className="hidden lg:flex items-center gap-6">
                        <button
                            onClick={() => {
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                setActiveCategory("All");
                                setSearchQuery("");
                            }}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => router.push(`/${storeSlug}/wishlist`)}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Wishlist
                        </button>
                        <Link
                            href={`/${storeSlug}/settings`}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Settings
                        </Link>
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

                <div className="max-w-[1600px] mx-auto px-5 lg:px-8 mb-4 lg:mb-6">
                    <div className="relative group max-w-2xl lg:max-w-3xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
                        <input
                            onChange={(e) => setSearchQuery(e.target.value)}
                            value={searchQuery}
                            type="text"
                            placeholder="Search products..."
                            className="w-full bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-2xl py-3.5 lg:py-4 pl-11 pr-4 text-sm lg:text-base font-medium text-gray-900 outline-none border border-gray-100 focus:border-gray-300 transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="relative group max-w-[1600px] mx-auto">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-6 lg:w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-6 lg:w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    <div
                        ref={(el) => { if (el) window.categoryScrollContainer = el; }}
                        className="px-5 lg:px-8 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth pb-3"
                    >
                        <div className="flex gap-2 lg:gap-3 pr-10">
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
                                    className={`px-4 lg:px-5 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-medium transition-all duration-300 flex-shrink-0 border ${activeCategory === cat
                                        ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
            <div className="px-5 lg:px-8 max-w-[1600px] mx-auto mt-6 lg:mt-8">
                {/* Section Header */}
                <div className="flex justify-between items-center mb-6 lg:mb-8">
                    <h2 className="text-base lg:text-lg font-semibold text-gray-900 tracking-tight flex items-center gap-2.5">
                        {activeCategory === "All" ? "All Products" : activeCategory}
                        <span className="text-[10px] lg:text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{filteredProducts.length}</span>
                    </h2>
                </div>

                {/* Grid - Responsive: 2 col mobile, 2 col small, 3 col tablet, 4 col desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
                    {filteredProducts.map(p => (
                        <ProductCard key={p.id} product={p} storeSlug={storeSlug} />
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full py-16 md:py-24 flex flex-col items-center justify-center text-center">
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

            {/* Bottom Nav - Floating Pill (Mobile Only) */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none lg:hidden">
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
                        href={`/${storeSlug}/settings`}
                        className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                    >
                        <Settings size={20} />
                    </Link>
                </nav>
            </div>

            {/* Global Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={toggleCart} storeId={storeId} storeName={storeName} storeOwnerPhone={storeOwnerPhone} />
        </div>
    );
}
