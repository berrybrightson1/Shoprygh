import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Truck, ShieldCheck, Star } from "lucide-react";
import { notFound } from "next/navigation";
import AddToCartBar from "@/components/AddToCartBar";
import CartHeaderButton from "@/components/CartHeaderButton";

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string; storeSlug: string }> }) {
    const { id, storeSlug } = await params;
    const product = await prisma.product.findUnique({
        where: { id }
    });

    if (!product) notFound();

    return (
        <div className="min-h-screen bg-white pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl px-4 py-4 flex items-center gap-4 border-b border-gray-200 shadow-sm">
                <Link href={`/${storeSlug}`} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition active:scale-95 text-black">
                    <ArrowLeft size={20} className="stroke-[3px]" />
                </Link>
                <div className="flex-1">
                    <h1 className="font-black text-xl text-black line-clamp-1">Product Details</h1>
                </div>
                <CartHeaderButton />
            </header>

            <main className="max-w-xl mx-auto px-4 pt-6">
                {/* Image Gallery */}
                <div className="aspect-square bg-gray-100 rounded-[32px] overflow-hidden shadow-inner relative border border-gray-200 mb-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={product.image || "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-contain p-8 mix-blend-multiply"
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-lg border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Star size={14} className="fill-yellow-400 text-yellow-500" />
                        <span className="text-xs font-black text-black">4.8</span>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Title & Category Group */}
                    <div>
                        <span className="inline-block px-3 py-1 mb-2 rounded-full bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest">
                            {product.category}
                        </span>

                        <div className="flex justify-between items-start gap-4">
                            <h1 className="text-3xl font-black text-black leading-tight flex-1 tracking-tight">{product.name}</h1>
                            <div className="shrink-0 flex items-baseline gap-0.5">
                                <span className="text-lg font-bold text-black align-top">₵</span>
                                <span className="text-4xl font-black text-black tracking-tighter">
                                    {Number(product.priceRetail).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="prose prose-lg prose-gray">
                        <p className="text-gray-900 font-medium leading-relaxed text-base border-t-2 border-dashed border-gray-200 pt-6">
                            {product.description || "No description available for this item."}
                        </p>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-black border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-wide">
                            <Truck size={16} strokeWidth={2.5} /> Fast Delivery
                        </div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-black border border-gray-200 rounded-2xl text-xs font-black uppercase tracking-wide">
                            <ShieldCheck size={16} strokeWidth={2.5} /> Quality Assured
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Bar */}
            <AddToCartBar product={{
                id: product.id,
                name: product.name,
                category: product.category,
                priceRetail: Number(product.priceRetail),
                image: product.image
            }} />
        </div>
    );
}
