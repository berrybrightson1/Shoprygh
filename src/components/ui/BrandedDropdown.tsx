"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
    value: string;
    label: string;
    description?: string;
    className?: string;
}

interface BrandedDropdownProps {
    name: string;
    defaultValue?: string;
    options: Option[];
    onChange?: (value: string) => void;
    placeholder?: string;
}

export default function BrandedDropdown({
    name,
    defaultValue = "",
    options,
    onChange,
    placeholder = "Select..."
}: BrandedDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState(defaultValue);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (newValue: string) => {
        setValue(newValue);
        setIsOpen(false);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            {/* Hidden Input for Form Submission */}
            <input type="hidden" name={name} value={value} />

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-3 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-brand-cyan/50 hover:shadow-md transition-all min-w-[140px] text-left outline-none focus:ring-2 focus:ring-brand-cyan/20 ${isOpen ? 'border-brand-cyan ring-2 ring-brand-cyan/20' : ''}`}
            >
                <div className="flex flex-col">
                    <span className={`text-xs font-bold uppercase tracking-wide ${selectedOption?.className || 'text-gray-900'}`}>
                        {selectedOption ? selectedOption.label : <span className="text-gray-400">{placeholder}</span>}
                    </span>
                </div>
                <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-cyan" : ""}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100/50 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${value === option.value
                                ? "bg-gray-50 text-gray-900"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <span className={option.className}>{option.label}</span>
                            {value === option.value && (
                                <Check size={14} className="text-brand-cyan" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
