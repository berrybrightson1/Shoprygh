"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { login, magicAdminLogin } from "./actions";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);

        try {
            const res = await login(formData);
            if (res?.error) {
                setError(res.error);
                toast.error(res.error);
            } else if (res?.success && res?.url) {
                // Success! Redirecting...
                toast.success("Welcome back!");
                router.push(res.url);
                return; // Keep loading state true while redirecting
            }
        } catch (e) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans selection:bg-brand-cyan/30 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-cyan/20 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-orange/20 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-gray-200/50 border border-white/50 overflow-hidden relative z-10 transition-all hover:scale-[1.01] duration-500">
                <div className="p-10 text-center relative">
                    <Link href="/" className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 transition p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-brand-cyan to-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30 rotate-3 ring-4 ring-white">
                        <Lock className="text-white" size={28} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 font-medium mt-2">Enter your credentials to access your store.</p>
                </div>

                <div className="p-10 pt-0">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50/50 backdrop-blur border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3">
                            <AlertCircle size={18} className="shrink-0" /> {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                defaultValue=""
                                placeholder="yourname@gmail.com"
                                className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan bg-gray-50/50 focus:bg-white transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan bg-gray-50/50 focus:bg-white transition-all font-bold text-gray-900 placeholder:font-normal placeholder:text-gray-400 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 hover:shadow-2xl hover:-translate-y-0.5 mt-2 active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} /> Logging in...
                                </>
                            ) : (
                                "Find My Store & Login"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center bg-gray-50 rounded-2xl p-4">
                        <p className="text-xs text-gray-500 font-medium">
                            Don't have a store yet?{" "}
                            <Link href="/signup" className="text-brand-cyan font-black hover:underline">
                                Create one here
                            </Link>
                        </p>
                    </div>

                    {/* Magic Admin Login (Developer Only) */}
                    <div className="mt-8 flex justify-center">
                        <form action={async () => {
                            setIsLoading(true);
                            const res = await magicAdminLogin();
                            if (res?.success && res?.url) {
                                router.push(res.url);
                            } else if (res?.error) {
                                toast.error(res.error);
                                setIsLoading(false);
                            }
                        }}>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 rounded-lg text-xs font-mono font-bold transition-all border border-gray-200 hover:border-gray-300 shadow-sm disabled:opacity-50"
                            >
                                <Lock size={12} className="opacity-70" />
                                [DEV] Magic Admin Access
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
