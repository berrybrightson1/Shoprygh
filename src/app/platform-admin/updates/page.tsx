"use client";

import { postSystemUpdate } from "./actions";
import { Sparkles, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CreateUpdatePage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100">
                <div className="bg-purple-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
                    <Link href="/platform-admin" className="text-purple-200 hover:text-white text-sm font-bold mb-4 inline-block transition">
                        &larr; Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-black flex items-center gap-3">
                        <Sparkles className="text-purple-200 fill-purple-100" />
                        Post System Update
                    </h1>
                    <p className="text-purple-100 mt-2">Announce new features or fixes to all store owners.</p>
                </div>

                <form
                    action={async (formData) => {
                        setIsSubmitting(true);
                        await postSystemUpdate(formData);
                    }}
                    className="p-8 space-y-6"
                >
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Update Title</label>
                            <input
                                name="title"
                                type="text"
                                required
                                placeholder="e.g. Winter Sale Features"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none font-bold text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Version</label>
                            <input
                                name="version"
                                type="text"
                                required
                                placeholder="v1.2.0"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none font-bold text-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Update Content / Patch Notes</label>
                        <textarea
                            name="content"
                            required
                            rows={6}
                            placeholder="• Added new feature X&#10;• Fixed bug Y&#10;• Improved performance"
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan outline-none font-medium text-gray-900 resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-purple-600 text-white font-black py-4 rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        {isSubmitting ? "Broadcasting..." : "Broadcast Update"}
                    </button>
                </form>
            </div>
        </div>
    );
}
