import { SignJWT, jwtVerify } from 'jose';
import prisma from './prisma';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me");

// Fixed OTP for development/testing
function generateOtp(): string {
    return "123456";
}

/**
 * Sends an OTP via the specified channel (currently mocks Email).
 * Returns a stateless signature to verify against later.
 */
export async function sendOtp(identifier: string, type: 'EMAIL' | 'PHONE' = 'EMAIL'): Promise<{ success: boolean; message?: string; signature?: string }> {
    try {
        const code = generateOtp();

        // In a real app, you would send the email here using Nodemailer or Resend
        console.log(`[OTP Service] Sending ${type} OTP to ${identifier}: ${code}`);

        // Generate Stateless Signature
        // We sign the identifier and the code. Any change to either invalidates the signature.
        const signature = await new SignJWT({ identifier, code, type })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('10m') // Code valid for 10 mins
            .sign(SECRET);

        return { success: true, signature };
    } catch (error) {
        console.error("[OTP Service] Error sending OTP:", error);
        return { success: false, message: "Failed to send OTP" };
    }
}

/**
 * Validates the OTP using the stateless signature.
 */
export async function validateOtp(identifier: string, code: string, signature?: string): Promise<{ success: boolean; message?: string }> {
    try {
        // 1. Try Stateless Verification (Preferred)
        if (signature) {
            try {
                const { payload } = await jwtVerify(signature, SECRET);
                if (payload.identifier === identifier && payload.code === code) {

                    // Update the user's verified status in DB if they exist (Best Effort)
                    // We do this AFTER successful verification
                    await prisma.user.updateMany({
                        where: { email: identifier },
                        data: { isVerified: true }
                    }).catch(() => null); // Ignore errors if user doesn't exist yet (e.g. signup)

                    return { success: true };
                }
            } catch (e) {
                console.warn("[OTP Service] Signature verification failed:", e);
            }
        }

        // 2. Fallback to DB (Legacy/Stateful) - Optional, can remove if going fully stateless
        // For now, if signature fails or isn't present, we reject.
        return { success: false, message: "Invalid or expired code" };

    } catch (error) {
        console.error("[OTP Service] Error validating OTP:", error);
        return { success: false, message: "Verification failed" };
    }
}
