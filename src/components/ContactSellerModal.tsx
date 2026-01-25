"use client";

import { X, MessageCircle, Phone } from "lucide-react";
import { useEffect } from "react";

interface ContactSellerModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeName: string;
    phone: string;
}

export default function ContactSellerModal({ isOpen, onClose, storeName, phone }: ContactSellerModalProps) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleWhatsApp = () => {
        window.open(`https://wa.me/${phone}`, '_blank');
        onClose();
    };

    const handleCall = () => {
        window.location.href = `tel:${phone}`;
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md mx-auto shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-300 sm:mb-0">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Contact Seller</h2>
                        <p className="text-sm text-gray-500 mt-0.5">{storeName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-600">Choose how you'd like to contact</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">+{phone}</p>
                    </div>

                    {/* WhatsApp Button */}
                    <button
                        onClick={handleWhatsApp}
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-[#25D366]/20"
                    >
                        <MessageCircle size={22} strokeWidth={2.5} />
                        Message on WhatsApp
                    </button>

                    {/* Call Button */}
                    <button
                        onClick={handleCall}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-gray-900/20"
                    >
                        <Phone size={22} strokeWidth={2.5} />
                        Call Seller
                    </button>

                    {/* Cancel */}
                    <button
                        onClick={onClose}
                        className="w-full text-gray-500 hover:text-gray-900 py-3 rounded-xl font-medium text-sm transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
