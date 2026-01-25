"use client";

import dynamic from "next/dynamic";

const Toaster = dynamic(() => import("sonner").then((mod) => mod.Toaster), {
    ssr: false,
});

export function DynamicToaster() {
    return (
        <Toaster
            position="bottom-center"
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: "bg-gray-900/90 backdrop-blur-xl border border-white/10 text-white rounded-2xl shadow-2xl shadow-black/20 p-3 flex items-center gap-3 w-full min-w-[320px]",
                    title: "text-white text-xs font-bold uppercase tracking-wider ml-1",
                    description: "text-gray-400 text-xs font-medium ml-1",
                    actionButton: "bg-white text-black text-xs font-bold px-4 py-2 rounded-xl active:scale-95 transition-all shadow-sm",
                    cancelButton: "text-gray-400 hover:text-white text-xs font-bold px-3 py-2 transition-colors",
                    error: "!bg-red-500/10 !border-red-500/20 !text-red-500",
                    success: "!bg-gray-900/90 !border-white/10 !text-white",
                    warning: "!bg-orange-500/10 !border-orange-500/20 !text-orange-500",
                    info: "!bg-blue-500/10 !border-blue-500/20 !text-blue-500",
                },
            }}
        />
    );
}
