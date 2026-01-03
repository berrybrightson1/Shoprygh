"use client";

import { Camera, Building2, Phone, MapPin, FileText, Save } from "lucide-react";
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
        if (logoPreview && logoPreview !== store.logo) {
            formData.set("logo", logoPreview);
        }
        await updateStoreProfile(formData);
        setIsSubmitting(false);
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            {/* Header with Save Button */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Store Profile</h2>
                    <p className="text-sm text-gray-600 mt-1">Update your store information and branding</p>
                </div>
                <button
                    type="submit"
                    form="profile-form"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-orange-600 transition-all disabled:opacity-50"
                >
                    <Save size={18} />
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
            </div>

            <form id="profile-form" action={handleSubmit} className="space-y-8">
                <input type="hidden" name="storeId" value={store.id} />

                {/* Logo & Branding Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Building2 size={20} className="text-brand-cyan" />
                        Store Branding
                    </h3>

                    <div className="grid md:grid-cols-[200px_1fr] gap-8">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Store Logo</label>
                            <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-4 border-dashed border-gray-300 hover:border-brand-cyan transition-colors group cursor-pointer bg-gray-50">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Store logo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-brand-cyan transition-colors">
                                        <Building2 size={48} />
                                        <p className="text-xs mt-2 font-medium">No logo</p>
                                    </div>
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                    <div className="text-white text-center">
                                        <Camera size={32} className="mx-auto mb-2" />
                                        <p className="text-sm font-bold">Choose Logo</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">PNG, JPG up to 30KB</p>
                        </div>

                        {/* Store Name & Description */}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Building2 size={16} className="text-gray-500" />
                                    Store Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    defaultValue={store.name}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan text-gray-900 font-semibold transition-all"
                                    placeholder="My Awesome Store"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <FileText size={16} className="text-gray-500" />
                                    Store Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    defaultValue={store.description || ""}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan text-gray-900 resize-none transition-all"
                                    placeholder="Tell customers about your store..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Phone size={20} className="text-brand-orange" />
                        Contact Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Phone Number */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Phone size={16} className="text-gray-500" />
                                Contact Phone
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                defaultValue={store.ownerPhone || ""}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-gray-900 transition-all"
                                placeholder="+233 24 123 4567"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <MapPin size={16} className="text-gray-500" />
                                Business Address
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                defaultValue={store.address || ""}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-gray-900 transition-all"
                                placeholder="123 Main Street, Accra"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
