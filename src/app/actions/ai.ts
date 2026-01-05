"use server";

import { logActivity } from "@/lib/audit";

// --- TEMPLATE LOGIC ---

const TEMPLATES = [
    "Experience the exceptional quality of {name}. Designed with {keywords} in mind, this product offers the perfect blend of style and functionality for your daily needs.",
    "Elevate your lifestyle with {name}. A premium choice that stands out for its {keywords} design and reliable performance.",
    "Discover {name}, the ultimate solution for those who value excellence. Whether you're looking for {keywords} or simply the best, this is for you.",
    "Introduce {name} to your collection today. Crafted for durability and style, it features {keywords} to ensure you get the standard you deserve.",
    "Meet {name}. A sophisticated addition to your life that promises quality. Perfect for anyone seeking {keywords} in one package.",
    "Upgrade to {name} and feel the difference. With its focus on {keywords}, it redefines what you expect from a premium product.",
    "Unleash the potential of {name}. Expertly designed to deliver results, combining {keywords} with unmatched reliability."
];

const FALLBACK_TEMPLATES = [
    "Experience the exceptional quality of {name}. Designed with precision in mind, this product offers the perfect blend of style and functionality for your daily needs.",
    "Elevate your lifestyle with {name}. A premium choice that stands out for its superior design and reliable performance.",
    "Discover {name}, the ultimate solution for those who value excellence. Crafted for durability and style to ensure you get the standard you deserve.",
    "Meet {name}. A sophisticated addition to your life that promises quality. Perfect for anyone seeking reliability in one package."
];

function getTemplate(hasKeywords: boolean): string {
    const list = hasKeywords ? TEMPLATES : FALLBACK_TEMPLATES;
    // Simple random selection
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

function formatList(items: string[]): string {
    if (items.length === 0) return "quality";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    // Limit to top 3 for flow
    const topItems = items.slice(0, 3);
    return `${topItems.slice(0, -1).join(", ")} and ${topItems[topItems.length - 1]}`;
}


/**
 * Generate a product description using "Smart Logic" (Templates)
 * Replaces the AI model with a deterministic, fast, and free approach.
 */
export async function generateProductDescription(
    productName: string,
    keywords: string[] = [],
    userId: string = "anonymous"
): Promise<{ success: boolean; description?: string; error?: string }> {

    // Simulate a short delay to make it feel like "work" is being done (UX)
    // and to prevent spam clicks feeling broken
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
        console.log(`[SmartGen] Generating for: "${productName}" with tags: [${keywords.join(', ')}]`);

        const hasKeywords = keywords.length > 0;
        const template = getTemplate(hasKeywords);

        let description = template.replace("{name}", productName);

        if (hasKeywords) {
            description = description.replace("{keywords}", formatList(keywords));
        }

        // Log for monitoring
        await logActivity(
            "AI_DESCRIPTION_GENERATED",
            `Auto-generated description for ${productName}`,
            "PRODUCT",
            undefined,
            { productName, keywords, mode: "TEMPLATE" }
        );

        return {
            success: true,
            description
        };
    } catch (error: any) {
        console.error("[SmartGen] Generation failed:", error);
        return {
            success: false,
            error: `Generation Failed: ${error.message || "Unknown error"}`
        };
    }
}
