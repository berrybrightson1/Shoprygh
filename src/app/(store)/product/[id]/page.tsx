import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Truck, ShieldCheck, Star } from "lucide-react";
import { notFound } from "next/navigation";
import AddToCartBar from "@/components/AddToCartBar";
import CartHeaderButton from "@/components/CartHeaderButton";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) notFound();

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-4 border-b border-gray-100">
                <Link href="/" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                    <ArrowLeft size={20} className="text-gray-700" />
                </Link>
                <div className="flex-1">
                    <h1 className="font-bold text-gray-900 line-clamp-1">Product Details</h1>
                </div>
                <CartHeaderButton />
            </header>

            <main className="max-w-xl mx-auto">
                {/* Image Gallery (Placeholder) */}
                <div className="aspect-square bg-gray-50 m-4 rounded-[32px] overflow-hidden shadow-inner relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={product.image || "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-contain p-8 mix-blend-multiply"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold">4.8</span>
                    </div>
                </div>

                <div className="px-6 pb-6">
                    <div className="space-y-4">
                        {/* Title & Category Group */}
                        <div>
                            <span className="text-black font-black text-xs uppercase tracking-widest mb-3 block">{product.category}</span>

                            <div className="flex justify-between items-start gap-4">
                                <h1 className="text-3xl font-black text-gray-900 leading-tight flex-1">{product.name}</h1>
                                <div className="text-3xl font-black text-gray-900 tracking-tighter shrink-0 bg-gray-50 px-3 py-1 rounded-xl">
                                    <span className="text-lg font-bold align-top mr-0.5 text-black">₵</span>
                                    {Number(product.priceRetail).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-900 font-medium leading-relaxed text-sm border-t border-gray-100 pt-4">
                            {product.description || "No description available for this item."}
                        </p>

                        {/* Features */}
                        <div className="flex flex-wrap gap-3 pt-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-black rounded-full text-xs font-bold">
                                <Truck size={14} /> Fast Delivery
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-black rounded-full text-xs font-bold">
                                <ShieldCheck size={14} /> Quality Assured
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Bar */}
            <AddToCartBar product={{
                ...product,
                priceRetail: Number(product.priceRetail)
            }} />
        </div>
    );
}
