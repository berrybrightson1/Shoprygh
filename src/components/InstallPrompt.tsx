"use client";

import { useEffect, useState } from "react";
import { X, Share, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export default function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        );

        setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            );
        };
    }, []);

    if (isStandalone) {
        return null; // Don't show if already installed
    }

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
        }
    };

    // Render for Android/Chrome (Native Prompt trigger)
    if (deferredPrompt) {
        return (
            <div className="fixed bottom-4 left-4 right-4 z-50 bg-white p-4 rounded-xl shadow-2xl border border-gray-100 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                            👶
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Add Shopry to Home Screen?</h3>
                            <p className="text-gray-500 text-sm mt-1">Get the app for a better experience.</p>
                        </div>
                    </div>
                    <button onClick={() => setDeferredPrompt(null)} className="text-gray-400" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>
                <div className="mt-4 flex gap-3">
                    <button onClick={() => setDeferredPrompt(null)} className="flex-1 py-2 rounded-lg font-bold text-sm text-gray-500 hover:bg-gray-50">Maybe later</button>
                    <button onClick={handleInstallClick} className="flex-1 py-2 rounded-lg font-bold text-sm bg-black text-white shadow-lg shadow-black/20">Install</button>
                </div>
            </div>
        );
    }

    // Render for iOS (Manual Instructions)
    if (isIOS) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md p-6 pb-8 border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-700">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">Install "Shopry"</h3>
                        <p className="text-sm text-gray-600 mt-1">Add to your Home Screen for the full experience.</p>
                    </div>
                    <button onClick={() => setIsIOS(false)} className="bg-gray-100 rounded-full p-1 text-gray-500" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-cyan">1.</span>
                        <span>Tap</span>
                        <Share size={18} className="text-blue-500" />
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-cyan">2.</span>
                        <span>Select</span>
                        <div className="flex items-center gap-1 font-bold">
                            <PlusSquare size={18} />
                            <span>Add to Home Screen</span>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white border-r-[10px] border-r-transparent"></div>
            </div>
        );
    }

    return null;
}
