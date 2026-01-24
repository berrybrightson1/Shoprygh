import { Store, Ban, Trash2, CheckCircle, User } from "lucide-react";
import Link from "next/link";
import BrandedDropdown from "@/components/ui/BrandedDropdown";
import { toast } from "sonner";
import { useState } from "react";
import DeleteConfirmation from "@/components/modals/DeleteConfirmation";
import { suspendStore, unsuspendStore, impersonateStoreOwner, updateStoreTierManually, verifyStore, rejectStore } from "./actions";
import { deleteStore as deleteStoreAction } from "../actions/platform";

interface StoreActionsProps {
    store: {
        id: string;
        slug: string;
        name: string;
        status: "ACTIVE" | "SUSPENDED" | "DELETED";
        tier: string;
        isVerified: boolean;
        verificationStatus: string;
    };
}

import { useRouter } from "next/navigation";

export default function StoreActions({ store }: StoreActionsProps) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteStoreAction(store.id);
            toast.success("Store deleted successfully");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete store");
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <div className="flex gap-2 items-center">
            {/* Tier Selector */}
            <form action={async (formData) => {
                await updateStoreTierManually(formData);
                toast.success("Store tier updated");
            }} className="mr-2">
                <input type="hidden" name="storeId" value={store.id} />
                <BrandedDropdown
                    name="tier"
                    defaultValue={store.tier}
                    onChange={(val) => {
                        // Hack to trigger form submission since BrandedDropdown uses a hidden input
                        // We need to find the form and submit it, or just call the action directly if we weren't using progressive enhancement.
                        // Since custom dropdowns update state, we can simulate a form submit or just call the server action wrapper?
                        // Actually, the easiest way with the existing form structure is to trigger requestSubmit on the form ref.
                        // But since BrandedDropdown is inside the form, we can just grab the form element differently or pass a ref.
                        // Let's use a simpler approach: hidden button click
                        document.getElementById(`submit-tier-${store.id}`)?.click();
                    }}
                    options={[
                        { value: "HUSTLER", label: "Hustler", className: "text-gray-600" },
                        { value: "PRO", label: "Pro", className: "text-purple-600" },
                        { value: "WHOLESALER", label: "Wholesaler", className: "text-orange-600" },
                    ]}
                />
                <button type="submit" id={`submit-tier-${store.id}`} className="hidden" />
            </form>

            <Link
                href={`/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Visit Store"
            >
                <Store size={18} />
            </Link>

            {/* Impersonation Button */}
            <form action={impersonateStoreOwner}>
                <input type="hidden" name="storeId" value={store.id} />
                <button
                    type="submit"
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                    title="Login As Owner"
                >
                    <User size={18} />
                </button>
            </form>

            {/* Verification Actions */}
            {store.verificationStatus === "PENDING" && (
                <>
                    <form action={async (formData) => {
                        await verifyStore(formData);
                        toast.success("Store verified successfully");
                    }}>
                        <input type="hidden" name="storeId" value={store.id} />
                        <button
                            type="submit"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Approve Verification"
                        >
                            <CheckCircle size={18} className="fill-green-100" />
                        </button>
                    </form>

                    <form action={async (formData) => {
                        await rejectStore(formData);
                        toast.error("Store verification rejected");
                    }}>
                        <input type="hidden" name="storeId" value={store.id} />
                        <button
                            type="submit"
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Reject Verification"
                        >
                            <Ban size={18} />
                        </button>
                    </form>
                </>
            )}

            {store.status === "ACTIVE" ? (
                <form action={suspendStore}>
                    <input type="hidden" name="storeId" value={store.id} />
                    <button
                        type="submit"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Suspend Store"
                    >
                        <Ban size={18} />
                    </button>
                </form>
            ) : (
                <form action={unsuspendStore}>
                    <input type="hidden" name="storeId" value={store.id} />
                    <button
                        type="submit"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Unsuspend Store"
                    >
                        <CheckCircle size={18} />
                    </button>
                </form>
            )}

            <button
                type="button"
                className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition"
                title="Delete Store"
                onClick={() => setIsDeleteModalOpen(true)}
            >
                <Trash2 size={18} />
            </button>

            <DeleteConfirmation
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={`Delete ${store.name}?`}
                message="Are you sure you want to completely remove this store? This action cannot be undone and will delete all products, orders, and data associated with it."
                confirmLabel="Delete Store"
                isLoading={isDeleting}
            />
        </div>
    );
}
