"use client";

import ProfileEditor from "../ProfileEditor";

export default function GeneralSettings({ store }: { store: any }) {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">Store Profile</h4>
                <p className="text-sm text-gray-500 mb-6">This information will be visible to your customers on the storefront.</p>
            </div>
            <ProfileEditor store={store} />
        </div>
    );
}
