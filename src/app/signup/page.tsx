"use client";

import { useState, useEffect, useRef } from "react";
import { createStore } from "./actions";
import { Loader2, Store, User, Mail, Lock, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { syncVerificationAction } from "@/app/actions/safety";

export default function SignupPage() {
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);

    // Form Data
    const [storeName, setStoreName] = useState("");
    const [slug, setSlug] = useState("");
    const [selectedPlan, setSelectedPlan] = useState<"HUSTLER" | "PRO">("HUSTLER");
    const [selectedAvatar, setSelectedAvatar] = useState<string>("https://api.dicebear.com/9.x/micah/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9");
    const [ownerName, setOwnerName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Verification State
    const [step, setStep] = useState<"DETAILS" | "VERIFY">("DETAILS");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    // Auth Polling State
    const isVerificationSynced = useRef(false);

    // Validation
    const isDetailsValid = storeName.trim() !== "" &&
        slug.trim() !== "" &&
        ownerName.trim() !== "" &&
        email.trim() !== "" &&
        email.includes("@") &&
        password.length >= 6;

    // Auto-generate slug from store name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setStoreName(val);
        const slugified = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        setSlug(slugified);
    };

    // Persistence: Save/Load Form Data
    useEffect(() => {
        const saved = localStorage.getItem("signup_formData");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.storeName) setStoreName(data.storeName);
                if (data.slug) setSlug(data.slug);
                if (data.ownerName) setOwnerName(data.ownerName);
                if (data.email) setEmail(data.email);
                if (data.password) setPassword(data.password);
                if (data.selectedPlan) setSelectedPlan(data.selectedPlan);
                if (data.selectedAvatar) setSelectedAvatar(data.selectedAvatar);
                if (data.isOtpSent) setIsOtpSent(true);
            } catch (e) {
                console.error("Failed to restore form state", e);
            }
        }
    }, []);

    const saveFormState = () => {
        localStorage.setItem("signup_formData", JSON.stringify({
            storeName, slug, ownerName, email, password, selectedPlan, selectedAvatar, isOtpSent: true
        }));
    };

    // Listen for Auth Changes (Magic Link Success)
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
                if (!isVerificationSynced.current && !isVerified) {
                    isVerificationSynced.current = true;
                    // Sync verify status
                    const res = await syncVerificationAction();
                    if (res.success) {
                        toast.success("Email Verified! You're ready to launch.");
                        setIsVerified(true);
                        setStep("VERIFY");
                    }
                }
            }
        });

        // Check initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session && !isVerified) {
                // Check if we have pending signup data
                const saved = localStorage.getItem("signup_formData");
                const hasPendingSignup = saved && JSON.parse(saved).storeName;

                if (!hasPendingSignup) {
                    await supabase.auth.signOut();
                    return;
                }

                syncVerificationAction().then(res => {
                    if (res.success) {
                        setIsVerified(true);
                        setStep("VERIFY");
                    }
                });
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, isVerified]);

    // Polling for session restoration (in case event didn't fire)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isOtpSent && !isVerified) {
            interval = setInterval(async () => {
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    const res = await syncVerificationAction();
                    if (res.success) {
                        setIsVerified(true);
                        setStep("VERIFY");
                        clearInterval(interval);
                    }
                }
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isOtpSent, isVerified, supabase]);

    const manualCheck = async () => {
        toast.info("Checking verification status...");
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            const res = await syncVerificationAction();
            if (res.success) {
                toast.success("Verified!");
                setIsVerified(true);
                setStep("VERIFY");
                return;
            }
        }
        toast.error("Not verified yet. Please click the link in your email.");
    };

    const handleGoogleLogin = async () => {
        saveFormState();
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback?next=/signup`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
        if (error) {
            toast.error(error.message);
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        saveFormState();
        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }
        setIsSendingOtp(true);
        try {
            // Send Magic Link
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=/signup`,
                }
            });

            if (error) {
                toast.error(error.message);
            } else {
                setIsOtpSent(true);
                setStep("VERIFY");
                toast.success("Link sent to " + email);
            }
        } catch (err) {
            toast.error("Error sending link");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address before continuing");
            return;
        }

        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.set("tier", selectedPlan);
        formData.set("email", email);
        formData.set("storeName", storeName);
        formData.set("storeSlug", slug);
        formData.set("ownerName", ownerName);
        formData.set("password", password);
        formData.set("isVerified", isVerified ? "true" : "false");
        formData.set("avatar", selectedAvatar);

        try {
            // Clear storage before creating store
            localStorage.removeItem("signup_formData");
            await createStore(formData);
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden selection:bg-brand-cyan/30">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-cyan/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/5 blur-[100px] pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-2xl shadow-gray-400/50 rotate-3 ring-4 ring-white">
                        <span className="font-black text-3xl text-white">S</span>
                    </div>
                </div>
                <h2 className="text-4xl font-black text-black tracking-tight mb-3">
                    Start your 14-day free trial
                </h2>
                <p className="text-gray-600 font-bold text-lg">
                    No credit card required. Cancel anytime.
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px] relative z-10">
                <div className="bg-white py-10 px-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[32px] sm:px-10 border border-gray-200">
                    <Link href="/" className="absolute top-6 left-6 text-gray-900 hover:text-black transition p-2 hover:bg-gray-100 rounded-full border border-transparent hover:border-gray-200">
                        <ArrowLeft size={20} className="stroke-[3px]" />
                    </Link>

                    <form className="space-y-8" onSubmit={handleSubmit}>

                        {step === "DETAILS" ? (
                            <>
                                {/* Plan Selection */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-black uppercase tracking-widest text-center">Select Your Plan</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div
                                            onClick={() => setSelectedPlan("HUSTLER")}
                                            className={`relative flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${selectedPlan === "HUSTLER" ? "border-brand-cyan bg-brand-cyan/5 shadow-lg shadow-brand-cyan/10" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"}`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${selectedPlan === "HUSTLER" ? "border-brand-cyan bg-brand-cyan text-white" : "border-gray-300 bg-transparent"}`}>
                                                <div className={`w-2.5 h-2.5 bg-white rounded-full transition-opacity ${selectedPlan === "HUSTLER" ? "opacity-100" : "opacity-0"}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-black text-gray-900 text-lg">Hustler</span>
                                                    <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Free</span>
                                                </div>
                                                <span className="text-gray-700 text-sm font-bold mt-0.5 block">Basic inventory, standard support.</span>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setSelectedPlan("PRO")}
                                            className={`relative flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${selectedPlan === "PRO" ? "border-brand-cyan bg-brand-cyan/5 shadow-lg shadow-brand-cyan/10" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"}`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${selectedPlan === "PRO" ? "border-brand-cyan bg-brand-cyan text-white" : "border-gray-300 bg-transparent"}`}>
                                                <div className={`w-2.5 h-2.5 bg-white rounded-full transition-opacity ${selectedPlan === "PRO" ? "opacity-100" : "opacity-0"}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-black text-gray-900 text-lg">Pro</span>
                                                    <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">₵50/mo</span>
                                                </div>
                                                <span className="text-gray-700 text-sm font-bold mt-0.5 block">Unlocks staff & advanced analytics.</span>
                                            </div>
                                        </div>
                                        <input type="hidden" name="tier" value={selectedPlan} />
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <h3 className="text-xs font-black text-black uppercase tracking-widest text-center bg-gray-50 py-2 rounded-lg">Store Details</h3>

                                    <div className="space-y-2">
                                        <label htmlFor="storeName" className="text-xs font-black text-gray-900 uppercase tracking-wider ml-1">Store Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Store className="h-5 w-5 text-gray-900" />
                                            </div>
                                            <input
                                                id="storeName"
                                                name="storeName"
                                                type="text"
                                                required
                                                value={storeName}
                                                onChange={handleNameChange}
                                                className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-brand-cyan/10 focus:border-brand-cyan bg-white transition-all font-bold text-gray-900 placeholder:text-gray-400 text-lg"
                                                placeholder="My Awesome Store"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="storeSlug" className="text-xs font-black text-gray-900 uppercase tracking-wider ml-1">Store URL</label>
                                        <div className="flex rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden focus-within:ring-4 focus-within:ring-brand-cyan/10 focus-within:border-brand-cyan transition-all bg-white">
                                            <span className="inline-flex items-center px-4 bg-gray-50 text-gray-600 text-sm font-black border-r-2 border-gray-200 tracking-tight">
                                                anaya.app/
                                            </span>
                                            <input
                                                type="text"
                                                name="storeSlug"
                                                id="storeSlug"
                                                required
                                                value={slug}
                                                onChange={(e) => setSlug(e.target.value)}
                                                className="flex-1 min-w-0 block w-full px-4 py-4 outline-none bg-white font-bold text-gray-900 placeholder:text-gray-400 text-lg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <h3 className="text-xs font-black text-black uppercase tracking-widest text-center bg-gray-50 py-2 rounded-lg">Owner Account</h3>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-gray-900 uppercase tracking-wider ml-1">Choose Your Avatar</label>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 sm:gap-4 p-4">
                                            {["Felix", "Aneka", "Milo", "Bailey", "Diana", "Caleb", "Alyssa", "Tiana", "Nala", "George", "Willow", "Zoe"].map((seed) => {
                                                const avatarUrl = `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
                                                const isSelected = selectedAvatar === avatarUrl;

                                                return (
                                                    <div
                                                        key={seed}
                                                        onClick={() => setSelectedAvatar(avatarUrl)}
                                                        className={`relative aspect-square rounded-full cursor-pointer transition-all duration-300 ease-out flex items-center justify-center overflow-hidden border ${isSelected
                                                            ? "scale-110 shadow-lg z-10 bg-white border-brand-cyan ring-2 ring-brand-cyan/20"
                                                            : "scale-95 opacity-80 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-105 hover:bg-white border-transparent"
                                                            }`}
                                                    >
                                                        <img
                                                            src={avatarUrl}
                                                            alt={seed}
                                                            className="w-full h-full object-cover bg-white"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <input type="hidden" name="avatar" value={selectedAvatar} />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="ownerName" className="text-xs font-black text-gray-900 uppercase tracking-wider ml-1">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-900" />
                                            </div>
                                            <input
                                                id="ownerName"
                                                name="ownerName"
                                                type="text"
                                                required
                                                value={ownerName}
                                                onChange={(e) => setOwnerName(e.target.value)}
                                                className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-brand-cyan/10 focus:border-brand-cyan bg-white transition-all font-bold text-gray-900 placeholder:text-gray-400 text-lg"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-xs font-black text-gray-900 uppercase tracking-wider ml-1">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-900" />
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                list="email-suggestions"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-brand-cyan/10 focus:border-brand-cyan bg-white transition-all font-bold text-gray-900 placeholder:text-gray-400 text-lg"
                                                placeholder="yourname@gmail.com"
                                            />
                                            <datalist id="email-suggestions">
                                                <option value="@gmail.com" />
                                                <option value="@yahoo.com" />
                                                <option value="@outlook.com" />
                                                <option value="@icloud.com" />
                                            </datalist>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="password" className="text-xs font-black text-gray-900 uppercase tracking-wider ml-1">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-900" />
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                autoComplete="new-password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-brand-cyan/10 focus:border-brand-cyan bg-white transition-all font-bold text-gray-900 placeholder:text-gray-400 text-lg"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep("VERIFY")}
                                    disabled={!isDetailsValid}
                                    className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-2 duration-200 ${isDetailsValid
                                        ? "bg-black text-white hover:bg-gray-900 shadow-black/10 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 active:scale-95"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                                        }`}
                                >
                                    Verify & Continue <ArrowRight size={20} />
                                </button>
                            </>
                        ) : (
                            <div className="animate-in slide-in-from-right duration-500">
                                <div className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <ShieldCheck className="w-16 h-16 text-brand-cyan mx-auto" />
                                        <h3 className="text-2xl font-black text-gray-900">
                                            Verify Email
                                        </h3>
                                        <p className="text-gray-600 font-bold max-w-xs mx-auto">
                                            We'll send a magic link to your email.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {!isOtpSent ? (
                                            <div className="space-y-4">
                                                {/* Google Button */}
                                                <button
                                                    type="button"
                                                    onClick={handleGoogleLogin}
                                                    className="w-full bg-white text-gray-900 border-2 border-gray-200 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                                                >
                                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                                        <path
                                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                            fill="#4285F4"
                                                        />
                                                        <path
                                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                            fill="#34A853"
                                                        />
                                                        <path
                                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                            fill="#FBBC05"
                                                        />
                                                        <path
                                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                            fill="#EA4335"
                                                        />
                                                    </svg>
                                                    Sign up with Google
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="bg-green-50 text-green-800 p-4 rounded-xl flex flex-col items-center gap-3 font-bold border border-green-200 text-center">
                                                    <CheckCircle2 size={32} />
                                                    <div>
                                                        <p className="text-lg">Link sent to {email}</p>
                                                        <p className="text-xs font-normal opacity-80 mt-1">
                                                            Click the link in your email to verify. This page will update automatically.
                                                        </p>
                                                    </div>
                                                </div>

                                                {!isVerified ? (
                                                    <div className="text-center py-8">
                                                        <Loader2 className="w-10 h-10 animate-spin text-brand-cyan mx-auto mb-4" />
                                                        <p className="font-bold text-gray-500 animate-pulse">Waiting for verification...</p>

                                                        <button
                                                            type="button"
                                                            onClick={manualCheck}
                                                            className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm mt-4 hover:bg-gray-800 transition shadow-lg mb-4"
                                                        >
                                                            I've Verified, Continue
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={handleSendOtp}
                                                            disabled={isSendingOtp}
                                                            className="text-xs font-bold text-gray-400 hover:text-black mt-2 underline block w-full"
                                                        >
                                                            Resend Link
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsOtpSent(false)}
                                                            className="text-xs font-bold text-gray-400 hover:text-black block w-full mt-3"
                                                        >
                                                            Change Email
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="bg-[#06B6D4]/10 text-[#06B6D4] p-6 rounded-2xl flex flex-col items-center gap-2 font-black border-2 border-[#06B6D4] animate-in zoom-in duration-300">
                                                        <ShieldCheck size={48} />
                                                        VERIFIED!
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Final Submit Button */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <input type="hidden" name="isVerified" value={isVerified.toString()} />
                                        {/* Terms & Conditions */}
                                        <div className="flex items-start bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="terms"
                                                    name="terms"
                                                    type="checkbox"
                                                    required
                                                    className="w-5 h-5 text-[#06B6D4] border-gray-300 rounded focus:ring-[#06B6D4] cursor-pointer accent-[#06B6D4]"
                                                />
                                            </div>
                                            <div className="ml-3 text-xs">
                                                <label htmlFor="terms" className="font-bold text-gray-700 block text-sm">
                                                    I agree to the{" "}
                                                    <Link href="/terms" target="_blank" className="text-black underline hover:text-brand-orange transition-colors">
                                                        Terms of Service
                                                    </Link>
                                                    {" "}and{" "}
                                                    <Link href="/privacy" target="_blank" className="text-black underline hover:text-brand-orange transition-colors">
                                                        Privacy Policy
                                                    </Link>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {isVerified && (
                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full bg-[#06B6D4] text-white py-5 rounded-2xl font-black text-xl hover:bg-cyan-600 transition-all shadow-xl shadow-cyan-200 hover:shadow-2xl hover:-translate-y-1 active:scale-95 duration-200 flex items-center justify-center gap-2"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Loader2 className="animate-spin" size={24} />
                                                            Creating Store...
                                                        </>
                                                    ) : (
                                                        "Launch Store 🚀"
                                                    )}
                                                </button>
                                            )}

                                            {!isVerified && (
                                                <button
                                                    type="button" // Prevent submit, just dummy
                                                    disabled
                                                    className="w-full bg-gray-200 text-gray-400 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-2 cursor-not-allowed"
                                                >
                                                    Verify to Launch
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {!isVerified && (
                                        <button
                                            type="button"
                                            onClick={() => setStep("DETAILS")}
                                            className="w-full text-gray-500 font-bold py-3 hover:text-black transition"
                                        >
                                            Back to Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="mt-8 text-center bg-gray-50 border-2 border-gray-100 rounded-2xl p-4">
                        <Link
                            href="/login"
                            className="text-sm font-bold text-gray-600 hover:text-black transition flex items-center justify-center gap-2"
                        >
                            Already have an account? <span className="text-brand-cyan font-black hover:underline">Sign in</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
