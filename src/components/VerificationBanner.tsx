"use client";

import { useState } from "react";
import { Mail, ShieldAlert, CheckCircle2, Loader2, X } from "lucide-react";
import { syncVerificationAction } from "@/app/actions/safety";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VerificationBanner({ user }: { user: any }) {
    const supabase = createClient();
    const [isVisible, setIsVisible] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    // State for modal/flow
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const router = useRouter();

    // If initially verified and not just verified in this session, don't show
    if (user.isVerified && !showSuccess) return null;
    if (!isVisible) return null;

    const handleSendOtp = async () => {
        if (!user.email) {
            toast.error("No email found for this account.");
            return;
        }
        setIsSendingOtp(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: user.email,
                options: {
                    shouldCreateUser: false, // User should already exist in Supabase ideally, or true if we want to create them
                    // Since they are in Prisma but maybe not Supabase, we should probably allow creation.
                }
            });

            if (error) {
                // If user doesn't exist and we said false, error.
                // If we want to allow linking, we might need true.
                // Let's try true to be safe, assuming email matches.
                const { error: signUpError } = await supabase.auth.signInWithOtp({
                    email: user.email,
                    options: { shouldCreateUser: true }
                });
                if (signUpError) {
                    toast.error(signUpError.message);
                    return;
                }
            }

            setIsOtpSent(true);
            toast.success("Code sent to Email!");
        } catch {
            toast.error("Error sending code");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            toast.error("Enter the 6-digit code");
            return;
        }
        setIsSendingOtp(true);
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: user.email,
                token: otp,
                type: 'email'
            });

            if (error) {
                toast.error(error.message || "Invalid Code");
                setIsSendingOtp(false);
                return;
            }

            if (data.session) {
                // Verified in Supabase! Now sync to Prisma
                const res = await syncVerificationAction();
                if (res.success) {
                    toast.success("Verified! Your account is now secure.");
                    setShowSuccess(true);
                    router.refresh();
                    setTimeout(() => {
                        setIsVisible(false);
                    }, 4000);
                } else {
                    toast.error(res.message);
                }
            }
        } catch {
            toast.error("Verification failed");
            setIsSendingOtp(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="bg-green-500 text-white px-6 py-3 border-b border-green-600 animate-in slide-in-from-top duration-500">
                <div className="flex items-center justify-center gap-3 max-w-7xl mx-auto font-bold">
                    <CheckCircle2 size={24} />
                    <span>Reference Verified Successfully! You're all set.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-brand-orange/10 border-b border-brand-orange/20 px-6 py-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0">
                        <ShieldAlert className="text-brand-orange" size={20} />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 text-sm">Action Required: Verify Account</h4>
                        <p className="text-gray-600 text-xs font-medium">
                            Verify your email address <span className="text-black font-bold">({user.email || "No Email"})</span> to unlock full features.
                        </p>
                    </div>
                </div>

                {!isExpanded ? (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="bg-black text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-gray-800 transition whitespace-nowrap"
                    >
                        Verify Now
                    </button>
                ) : (
                    <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 animate-in slide-in-from-right duration-300">
                        {!isOtpSent ? (
                            <button
                                onClick={handleSendOtp}
                                disabled={isSendingOtp}
                                className="bg-black text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSendingOtp ? <Loader2 className="animate-spin" size={14} /> : "Send Code"} <Mail size={14} />
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    className="bg-white border text-center border-brand-orange/30 rounded-lg w-24 px-2 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-orange/20"
                                />
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={isSendingOtp}
                                    className="bg-brand-orange text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-orange-600 transition disabled:opacity-50"
                                >
                                    {isSendingOtp ? <Loader2 className="animate-spin" size={14} /> : "Verify"}
                                </button>
                            </div>
                        )}
                        <button onClick={() => setIsExpanded(false)} title="Close" className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-300">
                            <X size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
