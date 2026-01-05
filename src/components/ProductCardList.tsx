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
    onEdit: (product: Product) => void;
}

export default function ProductCardList({ products, onEdit }: ProductCardListProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm md:hidden">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <Package size={20} />
                </div>
                <p className="text-sm font-bold text-gray-400">No products found</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 md:hidden">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform"
                >
                    {/* Image */}
                    <div className="relative w-16 h-16 shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package size={20} />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate text-sm mb-0.5">{product.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-brand-orange text-sm">₵{product.priceRetail.toFixed(2)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${product.stockQty > 0
                                    ? "bg-green-50 text-green-700 border border-green-100"
                                    : "bg-red-50 text-red-700 border border-red-100"
                                }`}>
                                {product.stockQty > 0 ? `${product.stockQty} in stock` : "Out of Stock"}
                            </span>
                        </div>
                    </div>

                    {/* Action */}
                    <button
                        onClick={() => onEdit(product)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        aria-label="Edit product"
                    >
                        <Edit size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
}
