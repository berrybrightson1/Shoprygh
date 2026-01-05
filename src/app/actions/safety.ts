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
        // 1. Check the dedicated verified numbers table (Guest Checkout)
        const verifiedNumber = await prisma.verifiedNumber.findUnique({
            where: { phone }
        });

        if (verifiedNumber) {
            return { isVerified: true };
        }

        // 2. Fallback: Check registered Users (Staff/Admins)
        const user = await prisma.user.findFirst({
            where: { phone, isVerified: true }
        });

        if (user) {
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
            // We use a dedicated table to avoid validation issues with the main User table.
            await prisma.verifiedNumber.upsert({
                where: { phone: phone },
                update: {}, // Already exists, do nothing
                create: {
                    phone: phone,
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

export async function reportCustomer(customerId: string, storeId: string, reason: string) {
    try {
        // Create the report
        await prisma.customerReport.create({
            data: {
                customerId,
                storeId,
                reason
            }
        });

        // Update customer trust score (Example logic: decrease by 10)
        await prisma.customer.update({
            where: { id: customerId },
            data: {
                trustScore: { decrement: 10 }
            }
        });

        return { success: true, newStatus: "FLAGGED" };
    } catch (error) {
        console.error("Error reporting customer:", error);
        return { success: false, message: "Failed to report customer" };
    }
}
