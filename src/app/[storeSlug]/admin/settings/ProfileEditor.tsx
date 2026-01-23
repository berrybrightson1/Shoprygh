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

    // Form states for dirty checking
    const [name, setName] = useState(store.name);
    const [description, setDescription] = useState(store.description || "");
    const [phone, setPhone] = useState(store.ownerPhone || "");
    const [address, setAddress] = useState(store.address || "");

    const isDirty =
        name !== store.name ||
        description !== (store.description || "") ||
        phone !== (store.ownerPhone || "") ||
        address !== (store.address || "") ||
        logoPreview !== (store.logo || "");

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
        <div className="space-y-12">
            <form id="profile-form" action={handleSubmit} className="space-y-12 pb-24">
                <input type="hidden" name="storeId" value={store.id} />

                {/* Logo & Branding Section */}
                <div className="">
                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Building2 size={20} className="text-brand-cyan" />
                        Store Branding
                    </h3>

                    <div className="grid md:grid-cols-[200px_1fr] gap-8">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Store Logo</label>
                            <div className="relative w-40 h-40 rounded-xl md:rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-brand-cyan transition-colors group cursor-pointer bg-gray-50">
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
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan text-gray-900 font-semibold transition-all placeholder:text-gray-400"
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
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-2 focus:ring-brand-cyan/20 focus:border-brand-cyan text-gray-900 resize-none transition-all placeholder:text-gray-400"
                                    placeholder="Tell customers about your store..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information Section */}
                <div className="border-t border-gray-100 pt-8">
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
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2.5 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange text-gray-900 transition-all placeholder:text-gray-400"
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
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-4 py-2.5 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange text-gray-900 transition-all placeholder:text-gray-400"
                                placeholder="123 Main Street, Accra"
                            />
                        </div>
                    </div>
                </div>

                {/* Floating Action Bar */}
                {isDirty && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="bg-white/80 backdrop-blur-xl border border-gray-100 p-2 rounded-[28px] shadow-2xl shadow-black/10 flex items-center gap-4 min-w-[300px] md:min-w-[450px]">
                            <div className="flex-1 px-4 hidden md:block border-r border-gray-100">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Unsaved Changes</p>
                                <p className="text-[10px] text-gray-500 font-medium">You have modified your store profile</p>
                            </div>
                            <div className="flex items-center gap-2 p-1 w-full md:w-auto">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setName(store.name);
                                        setDescription(store.description || "");
                                        setPhone(store.ownerPhone || "");
                                        setAddress(store.address || "");
                                        setLogoPreview(store.logo || "");
                                    }}
                                    className="px-6 py-3 rounded-2xl text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-white px-8 py-3 rounded-2xl text-xs font-black shadow-xl shadow-black/10 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
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
        </div>
    );
}
