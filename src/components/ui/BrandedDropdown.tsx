"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const handleToggle = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width
            });
        }
        setIsOpen(!isOpen);
    };

    // Update position on scroll/resize using CAPTURE phase to detect inner scrolling
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const updatePosition = () => {
                const rect = buttonRef.current?.getBoundingClientRect();
                if (rect) {
                    setPosition({
                        top: rect.bottom + 8,
                        left: rect.left,
                        width: rect.width
                    });
                }
            };

            // Critical: 'true' enables capture phase to catch scroll events from nested containers
            document.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);

            return () => {
                document.removeEventListener("scroll", updatePosition, true);
                window.removeEventListener("resize", updatePosition);
            };
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                // Check if click is inside the portal menu
                const dropdownMenu = document.getElementById(`dropdown-menu-${name}`);
                if (dropdownMenu && !dropdownMenu.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, name]);


    const handleSelect = (newValue: string) => {
        setValue(newValue);
        setIsOpen(false);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <>
            {/* Hidden Input for Form Submission */}
            <input type="hidden" name={name} value={value} />

            {/* Trigger Button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={handleToggle}
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

            {/* Portal Dropdown Menu */}
            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    id={`dropdown-menu-${name}`}
                    style={{
                        top: position.top,
                        left: position.left,
                        minWidth: position.width
                    }}
                    className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-gray-100/50 p-1.5 origin-top-left"
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent closing immediately
                                handleSelect(option.value);
                            }}
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
                </div>,
                document.body
            )}
        </>
    );
}
