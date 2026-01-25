"use client";

import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Truck, ShieldCheck, ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";
import AddToCartBar from "@/components/AddToCartBar";
import CartHeaderButton from "@/components/CartHeaderButton";
import ProductGallery from "@/components/storefront/ProductGallery";
import { useCurrencyStore } from "@/store/currency";
import { formatPrice, getCurrencySymbol } from "@/utils/currency";

export default function ProductDetailsClient({ product, storeSlug, storePhone, storeName }: { product: any; storeSlug: string; storePhone?: string | null; storeName: string }) {
    const currency = useCurrencyStore((state) => state.currency);
    const images = [product.image, ...(product.gallery || [])].filter(Boolean) as string[];

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <Link href={`/${storeSlug}`} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-95 text-black border border-transparent hover:border-black/5">
                    <ArrowLeft size={20} strokeWidth={2.5} />
                </Link>
                <span className="font-bold text-sm text-black uppercase tracking-widest hidden md:block">Product Details</span>
                <CartHeaderButton />
            </header>

            <main className="max-w-xl mx-auto px-4 pt-6">
                {/* Gallery */}
                <ProductGallery images={images.length > 0 ? images : ["/placeholder.png"]} />

                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 delay-100">
                    {/* Header Group */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-black/10">
                                {product.category}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-[1.1] tracking-tight mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-gray-900 tracking-tighter">
                                {formatPrice(Number(product.priceRetail), currency)}
                            </span>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-black">
                                <Truck size={16} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Fast Delivery</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-black">
                                <ShieldCheck size={16} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Quality Assured</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Description</h3>
                        <div className="prose prose-base prose-gray max-w-none">
                            <p className="text-gray-600 font-medium leading-relaxed">
                                {product.description || "Experience premium quality with this carefully curated item. Designed for modern needs."}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Bar */}
            <AddToCartBar
                product={{
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    priceRetail: Number(product.priceRetail),
                    image: product.image
                }}
                storePhone={storePhone}
                storeName={storeName}
            />
        </div>
    );
}
