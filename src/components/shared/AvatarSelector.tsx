"use client";

import { Check } from "lucide-react";

const SEEDS = ["Felix", "Aneka", "Milo", "Bailey", "Diana", "Caleb", "Alyssa", "Tiana", "Nala", "George", "Willow", "Zoe"];

interface AvatarSelectorProps {
    currentImage?: string | null;
    onSelect: (url: string) => void;
}

export default function AvatarSelector({ currentImage, onSelect }: AvatarSelectorProps) {
    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
            {SEEDS.map((seed) => {
                const url = `https://api.dicebear.com/9.x/micah/svg?seed=${seed}`;
                const isSelected = currentImage === url;

                return (
                    <button
                        key={seed}
                        type="button"
                        onClick={() => onSelect(url)}
                        className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all hover:scale-105 ${isSelected
                            ? "border-brand-cyan ring-4 ring-brand-cyan/20 scale-105"
                            : "border-gray-200 hover:border-brand-cyan/50"
                            }`}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={url}
                            alt={`Avatar ${seed}`}
                            className="w-full h-full object-cover bg-white"
                        />
                        {isSelected && (
                            <div className="absolute inset-0 bg-brand-cyan/20 flex items-center justify-center backdrop-blur-[1px]">
                                <Check className="text-brand-dark drop-shadow-sm" size={24} strokeWidth={4} />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
