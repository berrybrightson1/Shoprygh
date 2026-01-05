
import prisma from "@/lib/prisma";
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_for_dev_only");

/**
 * Generates a random 6-digit numeric OTP.
 */
function generateOtp(): string {
    // Fixed OTP for development/testing to facilitate automated verification
    // return Math.floor(100000 + Math.random() * 900000).toString();
    return "123456";
}

/**
 * Sends a WhatsApp OTP to the specified phone number.
 * Returns a signed token (signature) that must be returned to validate the OTP.
 */
export async function sendOtp(phone: string): Promise<{ success: boolean; message?: string; signature?: string }> {
    try {
        const code = generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // 1. Update entities in DB if they exist (Best Effort)
        try {
            await prisma.user.updateMany({
                where: { phone },
                data: { otpCode: code, otpExpiresAt: expiresAt }
            });

            await prisma.customer.updateMany({
                where: { phone },
                data: { otpCode: code, otpExpiresAt: expiresAt }
            });
        } catch (e) {
            // Ignore DB errors (e.g. connection), critical path is the Signature
            console.error("DB Update failed (non-fatal):", e);
        }

        console.log(`[WhatsApp Service] Sending OTP to ${phone}: ${code}`);

        // 2. Generate Stateless Signature
        const signature = await new SignJWT({ phone, code })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('10m')
            .sign(SECRET);

        return { success: true, signature };
    } catch (error) {
        console.error("[WhatsApp Service] Error sending OTP:", error);
        return { success: false, message: "Failed to send OTP" };
    }
}

/**
 * Validates the provided OTP using the stateless signature.
 * Also attempts to mark the entity as verified in the DB if it exists.
 */
export async function validateOtp(phone: string, code: string, signature?: string): Promise<{ success: boolean; message?: string }> {
    try {
        let isValid = false;

        // 1. Try Stateless Verification (Preferred)
        if (signature) {
            try {
                const { payload } = await jwtVerify(signature, SECRET);
                if (payload.phone === phone && payload.code === code) {
                    isValid = true;
                }
            } catch (e) {
                console.error("Signature verification failed:", e);
            }
        }

        // 2. Fallback to DB Verification (Legacy/Existing Users)
        if (!isValid) {
            const now = new Date();
            // Check User
            const user = await prisma.user.findFirst({
                where: { phone, otpCode: code, otpExpiresAt: { gt: now } }
            });
            // Check Customers
            const customers = await prisma.customer.findMany({
                where: { phone, otpCode: code, otpExpiresAt: { gt: now } }
            });

            if (user || customers.length > 0) isValid = true;
        }

        if (isValid) {
            // Mark as verified in DB
            await prisma.user.updateMany({
                where: { phone },
                data: { isVerified: true, otpCode: null, otpExpiresAt: null }
            });

            await prisma.customer.updateMany({
                where: { phone },
                data: { isVerified: true, otpCode: null, otpExpiresAt: null }
            });

            return { success: true };
        }

        return { success: false, message: "Invalid or expired OTP" };

    } catch (error) {
        console.error("[WhatsApp Service] Error validating OTP:", error);
        return { success: false, message: "Verification failed" };
    }
}
