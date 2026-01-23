"use client";

import { Save } from "lucide-react";
import AvatarSelector from "./shared/AvatarSelector";
import { useState } from "react";
import { updateUserProfile } from "@/app/actions/user";
import { toast } from "sonner";

interface UserProfileEditorProps {
    user: {
        name: string;
        image: string | null;
        email: string;
    };
}

export default function UserProfileEditor({ user }: UserProfileEditorProps) {
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(user.image);
    const [name, setName] = useState(user.name);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAvatarSelection, setShowAvatarSelection] = useState(false);

    const isDirty = name !== user.name || selectedAvatar !== user.image;

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        if (selectedAvatar) {
            formData.set("image", selectedAvatar);
        }
        try {
            await updateUserProfile(formData);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            {/* Avatar Selection */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-900">Profile Picture</label>
                    <button
                        type="button"
                        onClick={() => setShowAvatarSelection(!showAvatarSelection)}
                        className="text-sm font-medium text-brand-cyan hover:text-brand-cyan/80 transition-colors"
                    >
                        {showAvatarSelection ? "Cancel Selection" : "Change Picture"}
                    </button>
                </div>

                {showAvatarSelection && (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <AvatarSelector
                            currentImage={selectedAvatar}
                            onSelect={(avatar) => {
                                setSelectedAvatar(avatar);
                            }}
                        />
                        <input type="hidden" name="image" value={selectedAvatar || ""} />
                    </div>
                )}

                {!showAvatarSelection && (
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                            <img
                                src={selectedAvatar || `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(user.name)}`}
                                alt="Current Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <p className="text-sm text-gray-500">This will be your avatar across the platform.</p>
                    </div>
                )}
            </div>

            {/* Name Input */}
            <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-900 mb-2">Display Name</label>
                <input
                    id="userName"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all placeholder:text-gray-400 text-sm font-medium"
                    placeholder="e.g. Alex Smith"
                    required
                />
            </div>

            {/* Floating Action Bar */}
            {isDirty && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-white/80 backdrop-blur-xl border border-gray-100/50 p-2 rounded-[28px] shadow-2xl shadow-black/10 flex items-center gap-4 min-w-[300px] md:min-w-[450px]">
                        <div className="flex-1 px-4 hidden md:block border-r border-gray-100/50">
                            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Unsaved Changes</p>
                            <p className="text-[10px] text-gray-500 font-medium">You have modified your personal profile</p>
                        </div>
                        <div className="flex items-center gap-2 p-1 w-full md:w-auto">
                            <button
                                type="button"
                                onClick={() => {
                                    setName(user.name);
                                    setSelectedAvatar(user.image);
                                }}
                                className="px-6 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-white px-8 py-3 rounded-2xl text-xs font-medium shadow-xl shadow-black/10 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? "Saving..." : (
                                    <>
                                        <Save size={14} />
                                        Save Changes
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
