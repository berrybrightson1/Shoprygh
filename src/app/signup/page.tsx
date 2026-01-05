"use client";

import { useState } from "react";
import { createStore } from "./actions";
import { Loader2, Store, User, Mail, Lock, LayoutDashboard, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [storeName, setStoreName] = useState("");
    const [slug, setSlug] = useState("");

    // Auto-generate slug from store name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setStoreName(val);
        // Simple slugify: lowercase, replace spaces/special chars with hyphens
        const slugified = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        setSlug(slugified);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            await createStore(formData);
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden selection:bg-brand-cyan/30">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-cyan/10 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/10 blur-[130px] pointer-events-none" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
                <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-black to-gray-800 rounded-3xl flex items-center justify-center shadow-xl shadow-gray-200 rotate-3 ring-4 ring-white">
                        <span className="font-black text-2xl text-white">S</span>
                    </div>
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                    Start your 14-day free trial
                </h2>
                <p className="mt-2 text-gray-500 font-medium">
                    No credit card required. Cancel anytime.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl shadow-gray-200/50 rounded-[32px] sm:px-10 border border-white/60">
                    <Link href="/" className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 transition p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={20} />
                    </Link>

                    <form className="space-y-8" onSubmit={handleSubmit}>

                        {/* Plan Selection */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Select Your Plan</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <label className="relative flex items-center p-4 border-2 border-transparent rounded-2xl cursor-pointer bg-gray-50 hover:bg-white hover:shadow-md transition-all has-[:checked]:border-brand-cyan has-[:checked]:bg-brand-cyan/5 has-[:checked]:shadow-lg">
                                    <input
                                        id="plan-hustler"
                                        name="tier"
                                        type="radio"
                                        value="HUSTLER"
                                        defaultChecked
                                        className="sr-only peer"
                                    />
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 mr-4 flex items-center justify-center peer-checked:border-brand-cyan peer-checked:bg-brand-cyan text-white transition-all">
                                        <div className="w-2.5 h-2.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-black text-gray-900 text-lg">Hustler</span>
                                            <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Free</span>
                                        </div>
                                        <span className="text-gray-500 text-sm font-medium mt-0.5 block">Basic inventory, standard support.</span>
                                    </div>
                                </label>

                                <label className="relative flex items-center p-4 border-2 border-transparent rounded-2xl cursor-pointer bg-gray-50 hover:bg-white hover:shadow-md transition-all has-[:checked]:border-brand-cyan has-[:checked]:bg-brand-cyan/5 has-[:checked]:shadow-lg">
                                    <input
                                        id="plan-pro"
                                        name="tier"
                                        type="radio"
                                        value="PRO"
                                        className="sr-only peer"
                                    />
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 mr-4 flex items-center justify-center peer-checked:border-brand-cyan peer-checked:bg-brand-cyan text-white transition-all">
                                        <div className="w-2.5 h-2.5 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-black text-gray-900 text-lg">Pro</span>
                                            <span className="bg-brand-orange/10 text-brand-orange text-[10px] font-bold px-2 py-1 rounded-full uppercase">₵50/mo</span>
                                        </div>
                                        <span className="text-gray-500 text-sm font-medium mt-0.5 block">Unlocks staff & advanced analytics.</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-gray-300"><span className="bg-white px-2">Store Details</span></div>
                        </div>

                        {/* Store Section */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="storeName" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Store Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Store className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="storeName"
                                        name="storeName"
                                        type="text"
                                        required
                                        value={storeName}
                                        onChange={handleNameChange}
                                        className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan bg-gray-50/50 focus:bg-white transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400"
                                        placeholder="My Awesome Store"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="storeSlug" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Store URL</label>
                                <div className="flex rounded-2xl shadow-sm border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-brand-cyan/20 focus-within:border-brand-cyan transition-all">
                                    <span className="inline-flex items-center px-4 bg-gray-50/80 text-gray-500 text-sm font-bold border-r border-gray-200">
                                        anaya.app/
                                    </span>
                                    <input
                                        type="text"
                                        name="storeSlug"
                                        id="storeSlug"
                                        required
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="flex-1 min-w-0 block w-full px-4 py-3.5 outline-none bg-white font-bold text-gray-900 placeholder:font-normal"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-gray-300"><span className="bg-white px-2">Owner Account</span></div>
                        </div>

                        {/* Owner Section */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="ownerName" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="ownerName"
                                        name="ownerName"
                                        type="text"
                                        required
                                        className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan bg-gray-50/50 focus:bg-white transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        defaultValue="@gmail.com"
                                        className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan bg-gray-50/50 focus:bg-white transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400"
                                        placeholder="yourname@gmail.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan bg-gray-50/50 focus:bg-white transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-start bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                                />
                            </div>
                            <div className="ml-3 text-xs">
                                <label htmlFor="terms" className="font-medium text-gray-600 block">
                                    I agree to the{" "}
                                    <Link href="/terms" target="_blank" className="text-brand-orange hover:underline font-bold">
                                        Terms of Service
                                    </Link>
                                    {" "}and{" "}
                                    <Link href="/privacy" target="_blank" className="text-brand-orange hover:underline font-bold">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-0.5 mt-2 active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Creating Store...
                                    </>
                                ) : (
                                    "Create My Store"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center bg-gray-50 rounded-2xl p-4">
                        <Link
                            href="/login"
                            className="text-sm font-bold text-gray-500 hover:text-gray-900 transition flex items-center justify-center gap-2"
                        >
                            Already have an account? <span className="text-brand-cyan underline">Sign in</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
