"use client";

import UserProfileEditor from "@/components/UserProfileEditor";
import PasswordUpdateForm from "@/app/[storeSlug]/admin/settings/PasswordUpdateForm";

interface AccountSettingsProps {
    session: {
        name: string;
        email: string;
        image?: string | null;
    };
}

export default function AccountSettings({ session }: AccountSettingsProps) {
    return (
        <div className="space-y-10">
            <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Your Profile</h4>
                <p className="text-sm text-gray-500 mb-6">Update your personal information andavatar.</p>
                <UserProfileEditor
                    user={{
                        name: session.name || "User",
                        image: session.image || null,
                        email: session.email || ""
                    }}
                />
            </div>

            <div className="h-px bg-gray-100" />

            <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Security</h4>
                <p className="text-sm text-gray-500 mb-6">Manage your password and security preferences.</p>
                <PasswordUpdateForm userEmail={session.email} />
            </div>
        </div>
    );
}
