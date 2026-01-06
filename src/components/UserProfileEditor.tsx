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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAvatarSelection, setShowAvatarSelection] = useState(false);

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
                    <label className="text-sm font-bold text-gray-900">Profile Picture</label>
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
                <label htmlFor="userName" className="block text-sm font-bold text-gray-900 mb-2">Display Name</label>
                <input
                    id="userName"
                    name="name"
                    defaultValue={user.name}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan transition-all placeholder:text-gray-400 text-sm font-medium"
                    placeholder="e.g. Alex Smith"
                    required
                />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                    <Save size={16} />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
