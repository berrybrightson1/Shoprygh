"use client";

import { Camera } from "lucide-react";
import { useState } from "react";
import { updateStoreProfile } from "./profile-actions";

interface ProfileEditorProps {
    store: {
        id: string;
        name: string;
        slug: string;
        logo: string | null;
        ownerPhone: string | null;
        address: string | null;
        description: string | null;
    };
}

export default function ProfileEditor({ store }: ProfileEditorProps) {
    const [logoPreview, setLogoPreview] = useState(store.logo || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        // Add logo data URL if changed
        if (logoPreview && logoPreview !== store.logo) {
            formData.set("logo", logoPreview);
        }
        await updateStoreProfile(formData);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Store Profile</h2>

            <form action={handleSubmit} className="space-y-6">
                <input type="hidden" name="storeId" value={store.id} />

                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Store Logo</label>
                    <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Store logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Building2 size={40} />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-bold">
                                <Camera size={18} />
                                Choose Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                        </div>
                    </div>
                </div>

                {/* Store Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                        Store Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        defaultValue={store.name}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900 font-semibold"
                        placeholder="My Awesome Store"
                    />
                </div>

                {/* Phone Number */}
                <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2">
                        Contact Phone
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        defaultValue={store.ownerPhone || ""}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900"
                        placeholder="+233 24 123 4567"
                    />
                </div>

                {/* Address */}
                <div>
                    <label htmlFor="address" className="block text-sm font-bold text-gray-900 mb-2">
                        Business Address
                    </label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        defaultValue={store.address || ""}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900"
                        placeholder="123 Main Street, Accra"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
                        Store Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        defaultValue={store.description || ""}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900 resize-none"
                        placeholder="Tell customers about your store..."
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-orange text-white py-4 rounded-xl font-black hover:bg-orange-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Saving..." : "Save Profile"}
                </button>
            </form>
        </div>
    );
}
