"use client";

import { useState } from "react";
import { Plus, Mail, Shield } from "lucide-react";
import BrandedSelect from "@/components/shared/BrandedSelect";

interface OnboardMemberFormProps {
    storeId: string;
    createUserAction: (formData: FormData) => Promise<any>;
}

export default function OnboardMemberForm({ storeId, createUserAction }: OnboardMemberFormProps) {
    const [role, setRole] = useState("Inventory Staff");

    return (
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 sticky top-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                    <Plus size={20} strokeWidth={3} />
                </div>
                <h2 className="text-xl font-medium text-gray-900 tracking-tight">Onboard Member</h2>
            </div>

            <form action={createUserAction} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-2 ml-1">Identity Name</label>
                    <input
                        name="name"
                        type="text"
                        required
                        placeholder="e.g. Sarah Jones"
                        className="w-full bg-gray-50 border border-gray-200/50 rounded-2xl py-4 px-4 font-medium text-gray-900 focus:border-brand-cyan/30 focus:bg-white outline-none transition-all shadow-sm placeholder:text-gray-300"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-2 ml-1">Communication Channel</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="sarah@anaya.com"
                            className="w-full bg-gray-50 border border-gray-200/50 rounded-2xl py-4 pl-12 pr-4 font-medium text-gray-900 focus:border-brand-cyan/30 focus:bg-white outline-none transition-all shadow-sm placeholder:text-gray-300"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-2 ml-1">Clearance Level</label>
                    <BrandedSelect
                        name="role"
                        options={[
                            { label: "Logistics Specialist", value: "Inventory Staff" },
                            { label: "Executive Access (Owner)", value: "OWNER" }
                        ]}
                        value={role}
                        onChange={(val) => setRole(val)}
                        icon={<Shield size={16} />}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-2 ml-1">Initial Credentials</label>
                    <input
                        title="Temporary Password"
                        name="password"
                        type="text"
                        required
                        placeholder="Set temporary password"
                        className="w-full bg-gray-50 border border-gray-200/50 rounded-2xl py-4 px-4 font-medium text-gray-900 focus:border-brand-cyan/30 focus:bg-white outline-none transition-all shadow-sm font-mono text-sm tracking-widest text-base"
                    />
                </div>
                <button type="submit" className="w-full bg-black hover:bg-brand-cyan hover:text-black text-white font-medium py-5 rounded-2xl transition-all shadow-xl shadow-black/10 uppercase tracking-[0.2em] text-[11px] active:scale-95 group mt-4">
                    Activate Clearance
                </button>
            </form>
        </div>
    );
}
