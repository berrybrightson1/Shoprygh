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
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Sparkles size={18} />
            {isSeeding ? "Adding Products..." : "Add 6 Test Products"}
        </button>
    );
}
