"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sendOtp, validateOtp } from "@/lib/otp";

// --- New Sync Action for Supabase Auth ---
export async function syncVerificationAction() {
    const supabase = await createClient();

    // 1. Check Supabase Session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
        return { success: false, message: "Verification failed: No authentic session." };
    }

    // 2. Update Prisma User (if they exist)
    // For new signups, the user won't exist in Prisma yet (createStore handles that).
    // So we primarily want to return success to the frontend if the SESSION is valid.
    try {
        await prisma.user.update({
            where: { email: user.email },
            data: { isVerified: true }
        });
    } catch (e) {
        // Ignore error if user not found, strictly needed for new user flow
    }

    return { success: true };
}

// --- Legacy/Checkout OTP Actions (Phone/Email) ---

export async function checkVerificationStatus(phone: string) {
    try {
        // Assuming a user can be identified by a phone number.
        const user = await prisma.user.findFirst({
            where: { phone },
            select: { isVerified: true } // Only select the field we need
        });

        if (user && user.isVerified) {
            return { isVerified: true };
        }

        return { isVerified: false };
    } catch (error) {
        console.error("Error checking verification status:", error);
        // Fail closed for security: if we can't check, assume not verified.
        return { isVerified: false, error: "Database error occurred." };
    }
}

export async function sendOtpAction(identifier: string, type: 'EMAIL' | 'PHONE' = 'EMAIL') {
    return await sendOtp(identifier, type);
}

export async function verifyOtpAction(identifier: string, code: string, signature?: string) {
    const validationResult = await validateOtp(identifier, code, signature);

    if (validationResult.success) {
        // Identifier is the phone number in this flow.
        const phone = identifier;
        try {
            // Persist the verification status for future checkouts.
            // This creates a "ghost" user if one doesn't exist.
            // NOTE: This assumes your `User` model has a unique `phone` field and
            // can be created with only a phone number and verification status.
            await prisma.user.upsert({
                where: { phone: phone },
                update: { isVerified: true },
                create: {
                    phone: phone,
                    isVerified: true,
                },
            });
        } catch (error) {
            console.error("Failed to update user verification status:", error);
            // The OTP was valid, but DB update failed. The user can still proceed
            // with this order, but will need to verify again next time.
        }
    }

    return validationResult;
}
