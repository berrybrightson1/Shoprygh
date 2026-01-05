"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Simple in-memory rate limit store (resets on server restart)
// For production, consider using Redis or database-backed solution
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const DAILY_LIMIT = 5;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Get or create rate limit entry for a user
 */
function getRateLimit(userId: string): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = rateLimitStore.get(userId);

    if (!existing || now > existing.resetTime) {
        const newEntry = { count: 0, resetTime: now + DAY_IN_MS };
        rateLimitStore.set(userId, newEntry);
        return newEntry;
    }

    return existing;
}

/**
 * Increment and check rate limit
 * @returns true if allowed, false if rate limited
 */
function checkRateLimit(userId: string): boolean {
    const limit = getRateLimit(userId);

    if (limit.count >= DAILY_LIMIT) {
        return false;
    }

    limit.count++;
    rateLimitStore.set(userId, limit);
    return true;
}

/**
 * Generate a product description using Gemini AI
 * @param productName - Name of the product
 * @param keywords - Optional keywords/tags to include in context
 * @param userId - User identifier for rate limiting (defaults to "anonymous")
 */
export async function generateProductDescription(
    productName: string,
    keywords: string[] = [],
    userId: string = "anonymous"
): Promise<{ success: boolean; description?: string; error?: string }> {
    // Check rate limit
    if (!checkRateLimit(userId)) {
        return {
            success: false,
            error: "Daily AI limit reached (5/day). Upgrade to Pro for unlimited AI generation!"
        };
    }

    // Validate API key
    const apiKey = process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
        console.error("[AI] GOOGLE_AI_KEY not configured");
        return {
            success: false,
            error: "AI service not configured. Please contact support."
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const keywordContext = keywords.length > 0
            ? `Related keywords: ${keywords.join(", ")}.`
            : "";

        const prompt = `Write a compelling, short product description (2-3 sentences max) for an e-commerce listing.

Product Name: ${productName}
${keywordContext}

Requirements:
- Be concise and persuasive
- Highlight quality and value
- Use professional tone suitable for a retail store
- Do NOT include prices or promotions
- Do NOT use emojis or excessive punctuation
- Return ONLY the description text, nothing else`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const description = response.text().trim();

        // Log for monitoring (immutable logs as per requirements)
        console.log(`[AI][${new Date().toISOString()}] Generated description for "${productName}" (user: ${userId})`);

        return {
            success: true,
            description
        };
    } catch (error) {
        console.error("[AI] Generation failed:", error);
        return {
            success: false,
            error: "Failed to generate description. Please try again."
        };
    }
}
