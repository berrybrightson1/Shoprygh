import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

interface Option {
    label: string;
    value: string;
}

interface BrandedSelectProps {
    options: (string | Option)[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    icon?: React.ReactNode;
    name?: string; // For form submission
}

export default function BrandedSelect({
    options,
    value,
    onChange,
    placeholder = "Select Option",
    className = "",
    icon,
    name
}: BrandedSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const normalizedOptions: Option[] = options.map(opt =>
        typeof opt === 'string' ? { label: opt, value: opt } : opt
    );

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    useLayoutEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.bottom + window.scrollY + 8,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [isOpen]);

    // Close on simple click outside logic (simpler via backdrop)

    // Close on simple click outside logic (simpler via backdrop)

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Hidden Input for Form Submission */}
            {name && <input type="hidden" name={name} value={value} />}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-100 hover:border-brand-cyan/30 focus:border-brand-cyan/30 rounded-2xl px-5 py-4 flex items-center justify-between transition-all shadow-sm group"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {icon && <div className="text-gray-400 group-hover:text-brand-cyan transition-colors shrink-0">{icon}</div>}
                    <span className={`text-sm font-medium truncate mt-0.5 ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-brand-cyan' : ''}`}
                />
            </button>

            {isOpen && coords.width > 0 && typeof document !== 'undefined' && createPortal(
                <>
                    {/* Transparent Backdrop to handle click outside */}
                    <div
                        className="fixed inset-0 z-[59]"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Positioned Dropdown */}
                    <div
                        style={{
                            top: coords.top,
                            left: coords.left,
                            width: coords.width,
                            position: 'absolute'
                        }}
                        className="bg-white border border-gray-100 rounded-[24px] shadow-2xl shadow-black/10 z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top"
                    >
                        <div className="max-h-[300px] overflow-y-auto no-scrollbar p-2">
                            {normalizedOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-3 ${value === opt.value
                                        ? 'bg-brand-cyan/10 text-brand-cyan'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {value === opt.value && <Check size={16} strokeWidth={3} className="shrink-0" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}
