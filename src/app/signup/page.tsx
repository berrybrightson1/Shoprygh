"use client";

import { useState } from "react";
import { createStore } from "./actions";
import { Loader2, Store, User, Mail, Lock, LayoutDashboard, AlertCircle, ArrowLeft } from "lucide-react";
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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative">
                <Link href="/" className="absolute top-0 left-0 text-gray-400 hover:text-gray-600 transition p-2 hover:bg-white rounded-full sm:-ml-16">
                    <ArrowLeft size={24} />
                </Link>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white mb-4">
                    <span className="font-bold text-xl">S</span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Start your 14-day free trial
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    No credit card required. Cancel anytime.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Plan Selection */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Select Plan</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <label className="relative flex items-start p-4 border rounded-lg cursor-pointer hover:border-black transition-colors has-[:checked]:border-black has-[:checked]:bg-gray-50">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="plan-hustler"
                                            name="tier"
                                            type="radio"
                                            value="HUSTLER"
                                            defaultChecked
                                            className="focus:ring-black h-4 w-4 text-black border-gray-300"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="plan-hustler" className="font-bold text-gray-900 block">Hustler (Free)</label>
                                        <span className="text-gray-700 block">Basic inventory, standard support.</span>
                                    </div>
                                </label>
                                <label className="relative flex items-start p-4 border rounded-lg cursor-pointer hover:border-black transition-colors has-[:checked]:border-black has-[:checked]:bg-gray-50">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="plan-pro"
                                            name="tier"
                                            type="radio"
                                            value="PRO"
                                            className="focus:ring-black h-4 w-4 text-black border-gray-300"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="plan-pro" className="font-bold text-gray-900 block">Pro (₵50/mo)</label>
                                        <span className="text-gray-700 block">Multiple staff, advanced reports, custom domain.</span>
                                    </div>
                                </label>
                                <label className="relative flex items-start p-4 border rounded-lg cursor-pointer hover:border-black transition-colors has-[:checked]:border-black has-[:checked]:bg-gray-50">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="plan-wholesaler"
                                            name="tier"
                                            type="radio"
                                            value="WHOLESALER"
                                            className="focus:ring-black h-4 w-4 text-black border-gray-300"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="plan-wholesaler" className="font-bold text-gray-900 block">Wholesaler (₵200/mo)</label>
                                        <span className="text-gray-700 block">Wholesale pricing, SKU tracking, bulk tools.</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4"></div>

                        {/* Store Section */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Store Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">Store Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Store className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="storeName"
                                            name="storeName"
                                            type="text"
                                            required
                                            value={storeName}
                                            onChange={handleNameChange}
                                            className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 text-gray-900 placeholder:text-gray-400"
                                            placeholder="My Awesome Store"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="storeSlug" className="block text-sm font-medium text-gray-700">Store URL</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                            anaya.app/
                                        </span>
                                        <input
                                            type="text"
                                            name="storeSlug"
                                            id="storeSlug"
                                            required
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-md focus:ring-black focus:border-black sm:text-sm border-gray-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4"></div>

                        {/* Owner Section */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Owner Account</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="ownerName"
                                            name="ownerName"
                                            type="text"
                                            required
                                            className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 text-gray-900 placeholder:text-gray-400"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 text-gray-900 placeholder:text-gray-400"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            className="focus:ring-black focus:border-black block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 text-gray-900 placeholder:text-gray-400"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="focus:ring-black h-4 w-4 text-black border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="terms" className="font-medium text-gray-700">
                                    I agree to the{" "}
                                    <Link href="/terms" target="_blank" className="text-brand-orange hover:underline">
                                        Terms of Service
                                    </Link>
                                    {" "}and{" "}
                                    <Link href="/privacy" target="_blank" className="text-brand-orange hover:underline">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Creating Store...
                                    </>
                                ) : (
                                    "Create My Store"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3">
                            <Link
                                href="/login"
                                className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                            >
                                Sign in to existing store
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
