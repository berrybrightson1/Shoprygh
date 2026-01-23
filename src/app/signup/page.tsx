"use client";

import { useState } from "react";
import { createStore } from "./actions";
import { Loader2, Store, User, Mail, Lock, ArrowRight, ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState("");

    // Form Data
    const [storeName, setStoreName] = useState("");
    const [slug, setSlug] = useState("");
    const [selectedPlan, setSelectedPlan] = useState<"HUSTLER" | "PRO" | "WHOLESALER">("HUSTLER");
    const [selectedAvatar, setSelectedAvatar] = useState<string>("https://api.dicebear.com/9.x/micah/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9");
    const [ownerName, setOwnerName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [storeAddress, setStoreAddress] = useState("");

    // Auto-generate slug from store name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setStoreName(val);
        const slugified = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        setSlug(slugified);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSuccess && redirectUrl) {
            router.push(redirectUrl);
            return;
        }

        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.set("tier", selectedPlan);
        formData.set("email", email);
        formData.set("storeName", storeName);
        formData.set("storeSlug", slug);
        formData.set("ownerName", ownerName);
        formData.set("password", password);
        formData.set("password", password);
        formData.set("avatar", selectedAvatar);
        formData.set("storeAddress", storeAddress);

        try {
            const res = await createStore(formData);

            if (res.error) {
                toast.error(res.error);
                setIsLoading(false);
                return;
            }

            if (res.success && res.redirectUrl) {
                toast.success("Account created! Ready to launch.");
                setIsSuccess(true);
                setRedirectUrl(res.redirectUrl);
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create store");
        } finally {
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

            <div className="mt-6 md:mt-10 sm:mx-auto sm:w-full sm:max-w-[480px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <div className="bg-white py-6 px-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[32px] sm:px-10 border border-gray-200">
                    <Link href="/" className="absolute top-6 left-6 text-gray-900 hover:text-black transition p-2 hover:bg-gray-100 rounded-full border border-transparent hover:border-gray-200">
                        <ArrowLeft size={20} className="stroke-[3px]" />
                    </Link>

                    <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
                        {/* Plan Selection */}
                        <div className="space-y-3 md:space-y-4">
                            <h3 className="text-[10px] md:text-xs font-black text-black uppercase tracking-widest text-center">Select Your Plan</h3>
                            <div className="grid grid-cols-1 gap-3 md:gap-4">
                                <div
                                    onClick={() => setSelectedPlan("HUSTLER")}
                                    className={`relative flex items-center p-3 md:p-4 rounded-2xl cursor-pointer transition-all duration-200 ${selectedPlan === "HUSTLER" ? "border-2 border-black bg-gray-50 shadow-lg" : "border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"}`}
                                >
                                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border mr-3 md:mr-4 flex items-center justify-center transition-all ${selectedPlan === "HUSTLER" ? "border-black bg-black text-white" : "border-gray-300 bg-transparent"}`}>
                                        <div className={`w-2 md:w-2.5 h-2 md:h-2.5 bg-white rounded-full transition-opacity ${selectedPlan === "HUSTLER" ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-black text-gray-900 text-base md:text-lg">Hustler</span>
                                            <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Free</span>
                                        </div>
                                        <span className="text-gray-700 text-xs md:text-sm font-bold mt-0.5 block">Basic inventory, standard support.</span>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setSelectedPlan("PRO")}
                                    className={`relative flex items-center p-3 md:p-4 rounded-2xl cursor-pointer transition-all duration-200 ${selectedPlan === "PRO" ? "border-2 border-black bg-gray-50 shadow-lg" : "border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"}`}
                                >
                                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border mr-3 md:mr-4 flex items-center justify-center transition-all ${selectedPlan === "PRO" ? "border-black bg-black text-white" : "border-gray-300 bg-transparent"}`}>
                                        <div className={`w-2 md:w-2.5 h-2 md:h-2.5 bg-white rounded-full transition-opacity ${selectedPlan === "PRO" ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-black text-gray-900 text-base md:text-lg">Pro</span>
                                            <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">₵50/mo</span>
                                        </div>
                                        <span className="text-gray-700 text-xs md:text-sm font-bold mt-0.5 block">Unlocks staff & advanced analytics.</span>
                                    </div>
                                </div>

                                <div
                                    onClick={() => setSelectedPlan("WHOLESALER")}
                                    className={`relative flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-200 ${selectedPlan === "WHOLESALER" ? "border-2 border-brand-purple bg-purple-50 shadow-lg" : "border border-gray-200 bg-white hover:border-purple-200 hover:shadow-md"}`}
                                >
                                    <div className={`w-6 h-6 rounded-full border mr-4 flex items-center justify-center transition-all ${selectedPlan === "WHOLESALER" ? "border-brand-purple bg-brand-purple text-white" : "border-gray-300 bg-transparent"}`}>
                                        <div className={`w-2.5 h-2.5 bg-white rounded-full transition-opacity ${selectedPlan === "WHOLESALER" ? "opacity-100" : "opacity-0"}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="font-black text-brand-purple text-lg">Wholesaler</span>
                                            <span className="bg-brand-purple text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">₵200/mo</span>
                                        </div>
                                        <span className="text-gray-700 text-sm font-bold mt-0.5 block">For high-volume sellers & distros.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h3 className="text-xs font-black text-black uppercase tracking-widest text-center bg-gray-50 py-2 rounded-lg">Store Details</h3>

                            <div className="space-y-2">
                                <label htmlFor="storeName" className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-wider ml-1">Store Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                                        <Store className="h-4 w-4 md:h-5 md:w-5 text-gray-900" />
                                    </div>
                                    <input
                                        id="storeName"
                                        name="storeName"
                                        type="text"
                                        required
                                        value={storeName}
                                        onChange={handleNameChange}
                                        className="w-full border border-gray-200 rounded-2xl pl-10 md:pl-12 pr-4 py-3 md:py-4 outline-none focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan bg-white transition-all font-bold text-gray-900 placeholder:text-gray-400 text-base md:text-lg"
                                        placeholder="My Awesome Store"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="storeSlug" className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-wider ml-1">Store URL</label>
                                <div className="flex rounded-2xl shadow-sm border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-brand-cyan focus-within:border-brand-cyan transition-all bg-white">
                                    <span className="inline-flex items-center px-3 md:px-4 bg-gray-50 text-gray-600 text-xs md:text-sm font-black border-r border-gray-200 tracking-tight">
                                        anaya.app/
                                    </span>
                                    <input
                                        type="text"
                                        name="storeSlug"
                                        id="storeSlug"
                                        required
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className="flex-1 min-w-0 block w-full px-3 md:px-4 py-3 md:py-4 outline-none bg-white font-bold text-gray-900 placeholder:text-gray-400 text-base md:text-lg"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="storeAddress" className="text-[10px] md:text-xs font-black text-gray-900 uppercase tracking-wider ml-1">Business Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-gray-900" />
                                    </div>
                                    <input
                                        id="storeAddress"
                                        name="storeAddress"
                                        type="text"
                                        required
                                        value={storeAddress}
                                        onChange={(e) => setStoreAddress(e.target.value)}
                                        className="w-full border border-gray-200 rounded-2xl pl-10 md:pl-12 pr-4 py-3 md:py-4 outline-none focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan bg-white transition-all font-bold text-gray-900 placeholder:text-gray-400 text-base md:text-lg"
                                        placeholder="Accra, Ghana"
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
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setSelectedAvatar(avatarUrl)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedAvatar(avatarUrl); }}
                                                className={`relative aspect-square rounded-full cursor-pointer transition-all duration-300 ease-out flex items-center justify-center overflow-hidden border ${isSelected
                                                    ? "scale-110 shadow-lg z-10 bg-white border-brand-cyan ring-1 ring-brand-cyan/20"
                                                    : "scale-95 opacity-80 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-105 hover:bg-white border-transparent"
                                                    }`}
                                            >
                                                <img
                                                    src={avatarUrl}
                                                    alt={seed}
                                                    className="w-full h-full object-cover bg-white pointer-events-none" // Prevent img stealing click
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
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
                                        className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan bg-white transition-all font-bold text-gray-900 placeholder:text-gray-400 text-lg"
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
                                        className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan bg-white transition-all font-bold text-gray-900 placeholder:text-gray-400 text-lg"
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
                                        className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan bg-white transition-all font-bold text-gray-900 placeholder:text-gray-400 text-lg"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-2 duration-200 
                                ${isSuccess
                                    ? "bg-green-600 hover:bg-green-500 text-white shadow-green-200 scale-105"
                                    : "bg-black text-white hover:bg-gray-900 shadow-black/10 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 active:scale-95"
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    Creating Store...
                                </>
                            ) : isSuccess ? (
                                <>Launch Store 🚀</>
                            ) : (
                                <>Sign Up</>
                            )}
                        </button>
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
