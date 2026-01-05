"use client";

import { Check } from "lucide-react";

const SEEDS = ["Felix", "Aneka", "Milo", "Bailey", "Caleb", "Alyssa", "Tiana", "Nala", "George", "Jade", "River", "Sam"];

interface AvatarSelectorProps {
    currentImage?: string | null;
    onSelect: (url: string) => void;
}

export default function AvatarSelector({ currentImage, onSelect }: AvatarSelectorProps) {
    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
            {SEEDS.map((seed) => {
                const url = `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}`;
                const isSelected = currentImage === url;

                return (
                    <button
                        key={seed}
                        type="button"
                        onClick={() => onSelect(url)}
                        className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all hover:scale-110 ${isSelected
                                ? "border-brand-cyan ring-4 ring-brand-cyan/20 scale-105"
                                : "border-gray-200 hover:border-brand-purple"
                            }`}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={url}
                            alt={`Avatar ${seed}`}
                            className="w-full h-full object-cover bg-gray-50"
                        />
                        {isSelected && (
                            <div className="absolute inset-0 bg-brand-cyan/20 flex items-center justify-center backdrop-blur-[1px]">
                                <Check className="text-brand-dark-cyan drop-shadow-sm" size={24} strokeWidth={4} />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
