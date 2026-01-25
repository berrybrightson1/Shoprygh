"use client";

import { useRef, useState, useEffect } from "react";
import { Star } from "lucide-react";

export default function ProductGallery({ images }: { images: string[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const hasMultiple = images.length > 1;

    // Track scroll position to update dots
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const itemWidth = container.offsetWidth;
            const index = Math.round(scrollLeft / itemWidth);
            setCurrentIndex(index);
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="relative aspect-square bg-gray-100 rounded-[32px] overflow-hidden shadow-inner border border-gray-200 mb-8">
            {/* Scrollable Container with Snap */}
            <div
                ref={scrollRef}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-full"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {images.map((img, idx) => (
                    <div key={idx} className="flex-shrink-0 w-full h-full snap-center snap-always">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={img || "/placeholder.png"}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                    </div>
                ))}
            </div>

            {/* Dots Indicator */}
            {hasMultiple && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 pointer-events-none">
                    {images.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50 backdrop-blur-md'
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Rating Badge (Fixed) */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-lg border border-gray-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 z-20 pointer-events-none">
                <Star size={14} className="fill-yellow-400 text-yellow-500" />
                <span className="text-xs font-black text-black">4.8</span>
            </div>
        </div>
    );
}
