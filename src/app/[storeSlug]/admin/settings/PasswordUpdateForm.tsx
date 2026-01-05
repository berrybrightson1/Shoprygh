"use client";

import { useState } from "react";
import { Lock, Check, AlertCircle } from "lucide-react";
import { updatePassword } from "./pw-action"; // Separate action file to avoid circular deps if needed
import { toast } from "sonner";

export default function PasswordUpdateForm({ userEmail }: { userEmail: string }) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const res = await updatePassword(formData);
        setIsLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Password updated successfully");
            // Optional: reset form
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
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/5 bg-gray-50 text-gray-900 placeholder:text-gray-400 font-medium"
                    placeholder="••••••••"
                />
            </div>

            <div>
                <label className="text-xs font-bold text-gray-700 uppercase ml-1 block mb-2">New Password</label>
                <input
                    name="newPassword"
                    type="password"
                    required
                    minLength={6}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/5 bg-gray-50 text-gray-900 placeholder:text-gray-400 font-medium"
                    placeholder="Min. 6 characters"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-gray-200 hover:shadow-xl hover:bg-gray-800 transition-all disabled:opacity-50 mt-4"
            >
                {isLoading ? "Updating..." : (
                    <>
                        <Check size={18} /> Update Password
                    </>
                )}
            </button>
        </form>
    );
}
