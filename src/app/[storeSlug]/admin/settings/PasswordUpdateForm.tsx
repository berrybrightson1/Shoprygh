"use client";

import { useState } from "react";
import { Lock, Check, AlertCircle } from "lucide-react";
import { updatePassword } from "./pw-action"; // Separate action file to avoid circular deps if needed
import { toast } from "sonner";

export default function PasswordUpdateForm({ userEmail }: { userEmail: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const isDirty = currentPassword.length > 0 && newPassword.length > 0;

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const res = await updatePassword(formData);
        setIsLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Password updated successfully");
            setCurrentPassword("");
            setNewPassword("");
            const form = document.querySelector("#pw-form") as HTMLFormElement;
            form.reset();
        }
    }

    return (
        <form id="pw-form" action={handleSubmit} className="space-y-6 max-w-md">
            <input type="hidden" name="email" value={userEmail} />

            <div>
                <label className="text-xs font-bold text-gray-700 uppercase ml-1 block mb-2">Current Password</label>
                <input
                    name="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 outline-none focus:ring-2 focus:ring-black/5 bg-gray-50 text-gray-900 placeholder:text-gray-400 font-medium transition-all"
                    placeholder="••••••••"
                />
            </div>

            <div>
                <label className="text-xs font-bold text-gray-700 uppercase ml-1 block mb-2">New Password</label>
                <input
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full border border-gray-200 rounded-lg md:rounded-xl px-4 py-2.5 md:py-3 outline-none focus:ring-2 focus:ring-black/5 bg-gray-50 text-gray-900 placeholder:text-gray-400 font-medium transition-all"
                    placeholder="Min. 6 characters"
                />
            </div>

            {/* Floating Action Bar */}
            {isDirty && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-white/80 backdrop-blur-xl border border-gray-100 p-2 rounded-[28px] shadow-2xl shadow-black/10 flex items-center gap-4 min-w-[300px] md:min-w-[450px]">
                        <div className="flex-1 px-4 hidden md:block border-r border-gray-100">
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Security Update</p>
                            <p className="text-[10px] text-gray-500 font-medium">Ready to change your password</p>
                        </div>
                        <div className="flex items-center gap-2 p-1 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={() => {
                                    setCurrentPassword("");
                                    setNewPassword("");
                                }}
                                className="px-6 py-3 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-white px-8 py-3 rounded-2xl text-xs font-black shadow-xl shadow-black/10 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isLoading ? "Updating..." : (
                                    <>
                                        <Check size={14} />
                                        Update Password
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
}
