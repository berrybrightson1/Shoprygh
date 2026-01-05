"use client";

import { toPng } from 'html-to-image';
import { Download, Share2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ProductPosterProps {
    product: {
        name: string;
        price: number;
        image: string | null;
        storeName: string;
    };
}

export default function ProductPoster({ product }: ProductPosterProps) {
    const posterRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        if (!posterRef.current) return;
        setIsGenerating(true);

        try {
            const dataUrl = await toPng(posterRef.current, { cacheBust: true, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `${product.name.replace(/\s+/g, '-').toLowerCase()}-status.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Poster downloaded!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate poster.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div>
            {/* Action Button */}
            <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center gap-2 text-xs font-bold text-brand-orange hover:bg-orange-50 px-3 py-2 rounded-xl transition-colors"
            >
                {isGenerating ? <span className="animate-spin">⏳</span> : <Share2 size={16} />}
                Share to Status
            </button>

            {/* Hidden Poster Canvas (Off-screen) */}
            <div className="fixed left-[-9999px] top-0">
                <div
                    ref={posterRef}
                    className="w-[1080px] h-[1920px] bg-gradient-to-br from-gray-50 to-gray-100 relative flex flex-col items-center justify-between p-20 font-sans"
                    style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(6,182,212,0.1) 0%, transparent 50%)' }}
                >
                    {/* Header */}
                    <div className="w-full flex justify-between items-center">
                        <div className="bg-black text-white px-8 py-3 rounded-full text-3xl font-black uppercase tracking-widest">
                            {product.storeName}
                        </div>
                        <div className="text-4xl">✨ New Arrival</div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full gap-8">
                        <div className="w-[800px] h-[800px] bg-white rounded-[60px] shadow-2xl overflow-hidden p-6 border border-white/50">
                            {product.image ? (
                                <img src={product.image} className="w-full h-full object-cover rounded-[40px]" alt={product.name} />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-9xl font-black">
                                    ?
                                </div>
                            )}
                        </div>

                        <h1 className="text-8xl font-black text-gray-900 text-center leading-tight mt-8 max-w-[900px]">
                            {product.name}
                        </h1>

                        <div className="bg-brand-orange text-white px-16 py-6 rounded-full text-7xl font-black shadow-xl shadow-orange-500/30">
                            ₵{product.price.toFixed(2)}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="w-full bg-white/80 backdrop-blur-xl rounded-[40px] p-10 flex items-center gap-8 shadow-xl border border-white/50">
                        <div className="w-24 h-24 bg-green-500 rounded-3xl flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        </div>
                        <div>
                            <p className="text-3xl text-gray-500 font-bold uppercase tracking-wider mb-2">Order via WhatsApp</p>
                            <p className="text-5xl font-black text-gray-900">DM for Details</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
