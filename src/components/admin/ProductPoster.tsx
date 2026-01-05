"use client";

import { toJpeg } from 'html-to-image';
import { Share2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface ProductPosterProps {
    product: {
        id: string;
        name: string;
        price: number;
        image: string | null;
        storeName: string;
        storeSlug: string;
    };
    appDomain?: string;
}

export default function ProductPoster({ product, appDomain = "anaya.app" }: ProductPosterProps) {
    const posterRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Construct the deep link URL
    const productUrl = `https://${appDomain}/${product.storeSlug}/product/${product.id}`;
    const shortUrl = `${appDomain}/${product.storeSlug}/...`;

    const handleDownload = async () => {
        if (!posterRef.current) return;
        setIsGenerating(true);

        try {
            // Use toJpeg for better WhatsApp compression compatibility
            const dataUrl = await toJpeg(posterRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                quality: 0.92,
                backgroundColor: '#ffffff'
            });
            const link = document.createElement('a');
            link.download = `${product.name.replace(/\s+/g, '-').toLowerCase()}-status.jpg`;
            link.href = dataUrl;
            link.click();

            // Immutable log as per requirements
            console.log(`[STATUS_MAKER][${new Date().toISOString()}] Generated poster for product: ${product.id}`);

            toast.success("Poster downloaded!");
        } catch (err) {
            console.error("[STATUS_MAKER] Generation failed:", err);
            toast.error("Failed to generate poster.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full">
            {/* Action Button */}
            <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-3 text-base font-black text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 px-6 py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
            >
                {isGenerating ? (
                    <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Share2 size={20} />
                        Download Status Image
                    </>
                )}
            </button>

            {/* Hidden Poster Canvas (Off-screen) - 9:16 Vertical Story Format */}
            <div className="fixed left-[-9999px] top-0">
                <div
                    ref={posterRef}
                    style={{ width: 1080, height: 1920, backgroundColor: '#ffffff', fontFamily: 'var(--font-manrope), ui-sans-serif, system-ui, sans-serif' }}
                    className="relative flex flex-col overflow-hidden"
                >
                    {/* TOP 55%: Product Image */}
                    <div style={{ height: '55%', backgroundColor: '#f3f4f6' }} className="relative">
                        {product.image ? (
                            <img
                                src={product.image}
                                className="w-full h-full object-cover"
                                alt={product.name}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)' }}>
                                <span style={{ fontSize: 200, color: '#9ca3af', fontWeight: 900 }}>?</span>
                            </div>
                        )}

                        {/* Store Badge - Top Left */}
                        <div className="absolute" style={{ top: 40, left: 40 }}>
                            <div style={{ backgroundColor: '#000000', color: '#ffffff', padding: '16px 32px', borderRadius: 50, fontSize: 32, fontWeight: 900, letterSpacing: 4, textTransform: 'uppercase' }}>
                                {product.storeName}
                            </div>
                        </div>

                        {/* NEW ARRIVAL Badge - Top Right - BIGGER & STYLED */}
                        <div className="absolute" style={{ top: 40, right: 40 }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
                                color: '#ffffff',
                                padding: '20px 40px',
                                borderRadius: 60,
                                fontSize: 36,
                                fontWeight: 900,
                                boxShadow: '0 10px 40px rgba(249, 115, 22, 0.4)',
                                letterSpacing: 2,
                                textTransform: 'uppercase'
                            }}>
                                ✨ NEW ARRIVAL
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE 25%: Product Info */}
                    <div style={{ height: '25%', background: 'linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)', padding: '40px 60px' }} className="flex flex-col items-center justify-center">
                        {/* Product Name - BIGGER */}
                        <h1 style={{ fontSize: 72, fontWeight: 900, color: '#111827', textAlign: 'center', lineHeight: 1.1, marginBottom: 24, maxWidth: 950 }} className="line-clamp-2">
                            {product.name}
                        </h1>

                        {/* Price Badge - USING INLINE STYLE FOR COLOR */}
                        <div style={{
                            backgroundColor: '#f97316',
                            color: '#ffffff',
                            padding: '24px 64px',
                            borderRadius: 60,
                            fontSize: 80,
                            fontWeight: 900,
                            boxShadow: '0 20px 60px rgba(249, 115, 22, 0.35)',
                            marginBottom: 20
                        }}>
                            ₵{product.price.toFixed(2)}
                        </div>

                        {/* Store Availability */}
                        <p style={{ fontSize: 32, color: '#6b7280', fontWeight: 700 }}>
                            Available at <span style={{ color: '#111827', fontWeight: 900 }}>{product.storeName}</span>
                        </p>
                    </div>

                    {/* BOTTOM 20%: QR Code Footer - White Background */}
                    <div style={{ height: '20%', backgroundColor: '#ffffff', borderTop: '4px solid #e5e7eb', padding: '0 60px' }} className="flex items-center justify-between">
                        {/* Left: QR Code - BIGGER */}
                        <div style={{ backgroundColor: '#ffffff', padding: 20, borderRadius: 32, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '3px solid #e5e7eb' }}>
                            <QRCodeSVG
                                value={productUrl}
                                size={220}
                                level="H"
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                                includeMargin={false}
                            />
                        </div>

                        {/* Right: Call to Action - BIGGER & MORE DESCRIPTIVE */}
                        <div className="flex-1" style={{ marginLeft: 50, textAlign: 'right' }}>
                            <p style={{ fontSize: 56, fontWeight: 900, color: '#111827', marginBottom: 16 }}>
                                Scan to Order 📱
                            </p>
                            <p style={{ fontSize: 28, color: '#6b7280', fontWeight: 700, marginBottom: 8 }}>
                                Quick & Easy WhatsApp Checkout
                            </p>
                            <p style={{ fontSize: 36, color: '#f97316', fontWeight: 800 }}>
                                {shortUrl}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
