"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export default function ProductGallery({ images }: { images: string[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const hasMultiple = images.length > 1;

    const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="relative aspect-square bg-gray-100 rounded-[32px] overflow-hidden shadow-inner border border-gray-200 mb-8 group">
            {/* Main Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={images[currentIndex] || "/placeholder.png"}
                alt="Product"
                className="w-full h-full object-cover"
            />

            {/* Navigation Overlays */}
            {hasMultiple && (
                <>
                    {/* Visual Arrows (Always visible on hover, clickable) */}
                    <button
                        onClick={(e) => { e.preventDefault(); prev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-95 z-20"
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); next(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-95 z-20"
                        aria-label="Next image"
                    >
                        <ChevronRight size={18} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50 backdrop-blur-md'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Rating Badge (Fixed) */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-lg border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 z-20 pointer-events-none">
                <Star size={14} className="fill-yellow-400 text-yellow-500" />
                <span className="text-xs font-black text-black">4.8</span>
            </div>
        </div>
    );
}
