"use server";

import { logActivity } from "@/lib/audit";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy" });

/**
 * Generate a product description using Groq (Llama 3.2 Vision).
 * Inputs: Product Name, Keywords, Category, and optional Image
 */
export async function generateProductDescription(
    productName: string,
    keywords: string[] = [],
    category: string = "General",
    imageBase64: string | null = null,
    userId: string = "anonymous"
): Promise<{ success: boolean; description?: string; error?: string; source?: 'AI' }> {

    try {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("Missing GROQ_API_KEY. Please configure your .env file.");
        }

        console.log(`[Groq] Generating for: "${productName}"`);

        let userPrompt = `
**Role:**
You are an expert E-Commerce Copywriter. Your goal is to convert raw product details into a clean, minimal, and scannable list.

**Task:**
Generate a concise product breakdown for:
- **Product Name:** "${productName}"
- **Category:** "${category}"
${keywords.length > 0 ? `- **Key Features/Keywords:** ${keywords.join(', ')}` : ''}

**Strict Formatting Rules:**
1. **NO Headers:** Do not write "Section 1", "Features", or "Specs". Just output the lines.
2. **NO Asterisks (*):** Do not use asterisks for bullet points.
3. **Features (First 2-3 lines):** Start directly with the text. Use the format: \`[Feature Name]: [Short benefit]\`.
4. **Specs (Remaining lines):** Use a dot bullet (•) for technical details. Use the format: \`• [Label]: [Value]\`.
5. **Concise:** Keep descriptions short. Avoid extra adjectives.

**Target Output Style:**
Easy Lighting: Conveniently sized for effortless lighting.
Safe Handling: Designed to reduce risk of accidental fires.
• Material: Wood
• Length: 10cm
• Quantity: 50 sticks per pack
• Colors: Natural Wood
`;

        let messages: any[] = [];

        // Vision models are currently decommissioned/unavailable on Groq.
        // Falling back to text-only generation for stability.
        if (imageBase64) {
            console.warn("[Groq] Vision models unavailable. Proceeding with text-only generation.");
            // Append a note that we are ignoring the image
            userPrompt += " (Note: Product image was provided but vision analysis is temporarily unavailable. Describe based on name and keywords.)";
        }

        messages = [
            {
                role: "user",
                content: userPrompt,
            },
        ];

        const completion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 500,
            top_p: 1,
            stream: false,
            stop: null,
        });

        const description = completion.choices[0]?.message?.content || "";

        // Log for monitoring
        await logActivity(
            "AI_DESCRIPTION_GENERATED",
            `Groq Llama 3.2 generated description for ${productName}`,
            "PRODUCT",
            undefined,
            { productName, keywords, mode: imageBase64 ? "LLAMA_3.2_VISION" : "LLAMA_3_70B" }
        );

        return {
            success: true,
            description: description.trim(),
            source: 'AI'
        };

    } catch (error: any) {
        console.error("[Groq] Generation failed:", error);
        return {
            success: false,
            error: `AI Generation Failed: ${error.message || "Unknown error"}`
        };
    }
}
