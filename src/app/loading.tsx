import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-brand-cyan/10 rounded-2xl flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
            </div>
            <p className="text-gray-400 text-sm font-bold tracking-widest uppercase animate-pulse">Loading Shopry...</p>
        </div>
    );
}
