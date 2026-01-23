"use client";

import { BadgeCheck, Zap, Shield, TrendingUp, CheckCircle2, Lock, Clock, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { requestVerification } from "./actions";

interface VerificationClientProps {
    store: {
        id: string;
        name: string;
        isVerified: boolean;
        tier: string;
        verificationStatus: string;
    };
    stats: {
        sales: number;
        salesGoal: number;
        shipTime: number; // hours
        shipTimeGoal: number; // hours
        identityVerified: boolean;
    };
}

export default function VerificationClient({ store, stats }: VerificationClientProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [kycDocument, setKycDocument] = useState<string>("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File is too large (Max 5MB)");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setKycDocument(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFastTrack = async () => {
        if (!kycDocument) {
            toast.error("Please upload a document first");
            return;
        }

        setIsLoading(true);
        try {
            const res = await requestVerification(store.id, kycDocument);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Verification requested! We will review shortly.");
                setShowUpload(false);
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Value Prop Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
                <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                            <TrendingUp size={14} />
                            Seller Insight
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            Verified Stores sell <br />
                            <span className="text-blue-200">2.5x more products.</span>
                        </h2>
                        <p className="font-medium text-blue-100 text-lg leading-relaxed max-w-md">
                            Customers feel safer buying from verified sellers. Unlock the badge to show you mean business.
                        </p>
                    </div>
                    {/* Visual Mockup */}
                    <div className="hidden md:flex justify-end relative">
                        <div className="bg-white text-gray-900 p-4 rounded-2xl shadow-lg rotate-3 w-64 absolute right-0 top-1/2 -translate-y-1/2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-gray-200" />
                                <div>
                                    <div className="w-24 h-3 bg-gray-200 rounded-full mb-1" />
                                    <div className="w-16 h-2 bg-gray-100 rounded-full" />
                                </div>
                                <BadgeCheck className="text-blue-500 fill-blue-50 ml-auto" />
                            </div>
                            <div className="space-y-2">
                                <div className="w-full h-24 bg-gray-100 rounded-xl" />
                                <div className="w-2/3 h-3 bg-gray-200 rounded-full" />
                            </div>
                        </div>
                        {/* Glow effect */}
                        <div className="w-64 h-64 bg-blue-400/30 blur-[80px] rounded-full absolute right-10 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Choose your path</h3>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Option 1: Fast Track (Paywall / Upload) */}
                <div className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold uppercase px-4 py-2 rounded-bl-2xl">
                        Recommended
                    </div>

                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                        <Zap size={28} className="fill-yellow-400 text-yellow-400" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Fast Track</h3>
                    <p className="text-gray-500 font-medium mb-6 min-h-[48px]">
                        {store.verificationStatus === "PENDING"
                            ? "Your request is under priority review."
                            : "Get verified instantly. Ideal for serious sellers who want to start strong."}
                    </p>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <CheckCircle2 size={18} className="text-green-500" />
                            Instant Verification Review
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <CheckCircle2 size={18} className="text-green-500" />
                            Priority Support Line
                        </li>
                        <li className="flex items-center gap-3 text-sm font-medium text-gray-700">
                            <CheckCircle2 size={18} className="text-green-500" />
                            "Verified" Search Filter Visibility
                        </li>
                    </ul>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                        {store.verificationStatus === "PENDING" ? (
                            <button
                                disabled
                                className="w-full py-4 bg-yellow-100 text-yellow-700 font-bold rounded-xl border border-yellow-200 cursor-default flex items-center justify-center gap-2"
                            >
                                <Clock size={20} />
                                Pending Review
                            </button>
                        ) : store.isVerified ? (
                            <button
                                disabled
                                className="w-full py-4 bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 cursor-default flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={20} />
                                Verified
                            </button>
                        ) : showUpload ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-500 transition-colors relative cursor-pointer group/upload">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        aria-label="Upload KYC Document"
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    />
                                    {kycDocument ? (
                                        <div className="flex flex-col items-center text-green-600">
                                            <CheckCircle2 size={32} className="mb-2" />
                                            <p className="text-sm font-bold">Document Selected</p>
                                            <p className="text-xs">Click to change</p>
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 group-hover/upload:text-blue-500 transition-colors">
                                            <Upload size={32} className="mx-auto mb-2" />
                                            <p className="text-sm font-bold text-gray-700">Upload Business ID</p>
                                            <p className="text-xs text-gray-500 mt-1">Passport, Ghana Card, or Cert.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowUpload(false)}
                                        aria-label="Cancel upload"
                                        className="py-4 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-all"
                                    >
                                        <X size={20} />
                                    </button>
                                    <button
                                        onClick={handleFastTrack}
                                        disabled={isLoading || !kycDocument}
                                        className="flex-1 py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? "Uploading..." : "Submit Application"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-end gap-2 mb-4">
                                    <span className="text-4xl font-bold text-gray-900">₵50</span>
                                    <span className="text-gray-400 font-medium mb-1">/ one-time</span>
                                </div>
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-black/20 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Get Verified Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Option 2: Organic (Milestone) */}
                <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-200 relative">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-400 mb-6 border border-gray-200">
                        <Shield size={28} />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Standard Path</h3>
                    <p className="text-gray-500 font-medium mb-6 min-h-[48px]">
                        Earn your badge by consistently delighting customers.
                    </p>

                    <div className="space-y-6 mb-8">
                        {/* Milestone 1 */}
                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5">
                                <span>Completed Orders</span>
                                <span>{stats.sales} / {stats.salesGoal}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((stats.sales / stats.salesGoal) * 100, 100)}%` }} />
                            </div>
                        </div>

                        {/* Milestone 2 */}
                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5">
                                <span>Avg. Ship Time</span>
                                <span className={stats.shipTime <= stats.shipTimeGoal ? "text-green-600" : "text-orange-500"}>
                                    {stats.shipTime}h / {stats.shipTimeGoal}h target
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full w-full ${stats.shipTime <= stats.shipTimeGoal ? "bg-green-500" : "bg-orange-400"}`} />
                            </div>
                        </div>

                        {/* Milestone 3 */}
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                            {stats.identityVerified ? (
                                <CheckCircle2 size={20} className="text-green-500" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                            )}
                            <span className={`text-sm font-bold ${stats.identityVerified ? "text-gray-900" : "text-gray-400"}`}>
                                Identity Verified
                            </span>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-200/50">
                        <button disabled className="w-full py-4 bg-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                            <Lock size={16} />
                            Locked until milestones met
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
