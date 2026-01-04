"use client";

import { useState } from "react";
import { seedTestProducts } from "./seed-action";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export default function SeedProductsButton({ storeId }: { storeId: string }) {
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeed = async () => {
        setIsSeeding(true);

        try {
            const result = await seedTestProducts(storeId);

            if (result.success) {
                toast.success(result.message);
                window.location.reload(); // Refresh to show new products
            } else {
                toast.info(result.message);
            }
        } catch (error) {
            toast.error("Failed to add test products");
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg text-xs font-bold hover:bg-white hover:border-gray-300 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
        >
            <Sparkles size={14} />
            {isSeeding ? "Adding..." : "Add 6 Test Products"}
        </button>
    );
}
