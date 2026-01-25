"use client";

import { Edit, Package } from "lucide-react";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
    priceRetail: number;
    image: string | null;
    stockQty: number;
    category: string;
}

interface ProductCardListProps {
    products: Product[];
    onEdit?: (product: Product) => void;
}

export default function ProductCardList({ products, onEdit }: ProductCardListProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm md:hidden">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <Package size={20} />
                </div>
                <p className="text-sm font-medium text-gray-400">No products found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 md:hidden pb-20">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-5 relative overflow-hidden group"
                >
                    {/* Decorative Hint */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-cyan opacity-0 group-active:opacity-100 transition-opacity" />

                    {/* Image */}
                    <div className="relative w-20 h-20 shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shadow-inner">
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package size={24} />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 py-1">
                        <div className="flex justify-between items-start mb-1.5">
                            <h3 className="font-medium text-gray-900 truncate text-[15px] leading-tight pr-2 tracking-tight">{product.name}</h3>
                            <span className="text-[9px] font-medium uppercase tracking-widest text-brand-cyan bg-cyan-50 px-2 py-1 rounded-lg border border-cyan-100/50 shrink-0">
                                {product.category}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900 text-lg tracking-tight tabular-nums">₵{product.priceRetail.toFixed(2)}</span>
                            <div className="h-4 w-px bg-gray-100" />
                            <div className={`flex items-center gap-1.5 ${product.stockQty > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${product.stockQty > 0 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"}`} />
                                <span className="text-[10px] font-medium uppercase tracking-widest">
                                    {product.stockQty > 0 ? `${product.stockQty} Unit${product.stockQty > 1 ? 's' : ''}` : "Out of Stock"}
                                </span>
                            </div>
                        </div>

                        {/* ID Hint */}
                        <p className="text-[9px] font-medium text-gray-300 uppercase tracking-widest mt-2">SN: {product.id.slice(-6).toUpperCase()}</p>
                    </div>

                    {/* Action */}
                    {onEdit && (
                        <button
                            onClick={() => onEdit(product)}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all active:scale-90 border border-transparent hover:border-black/5"
                            aria-label="Edit product"
                        >
                            <Edit size={20} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
